import json
import random
import io
import html

from datetime import date
from decimal import Decimal, InvalidOperation

from django import forms
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.contrib.auth.views import LoginView
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.templatetags.static import static
from django.urls import reverse_lazy
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.views.generic import (
    ListView,
    DetailView,
    CreateView,
    UpdateView,
)

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle,
)
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
)

from .forms import DocumentUploadForm
from .models import customers, Document, BillingDocument, BillingItem


# ============================================================
# GENERAL PAGES
# ============================================================

def landing_page(request):
    return render(request, 'base/landing.html')


@login_required(login_url='login')
def dashboard_hub(request):
    return render(request, 'base/launchpad.html')


# ============================================================
# CUSTOMER / CRM
# ============================================================

class CustomerList(LoginRequiredMixin, ListView):
    model = customers
    template_name = 'base/customers.html'
    context_object_name = 'customers'

    def get_queryset(self):
        queryset = customers.objects.filter(
            assigned_to=self.request.user
        )

        search_input = self.request.GET.get('search', '').strip()

        if search_input:
            queryset = queryset.filter(
                Q(contact_name__icontains=search_input)
                | Q(opportunity_name__icontains=search_input)
                | Q(contact_email__icontains=search_input)
            )

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['search_input'] = self.request.GET.get(
            'search', ''
        )
        return context


class CustomerDetail(LoginRequiredMixin, DetailView):
    model = customers
    context_object_name = 'customer'
    template_name = 'base/customer.html'

    def get_queryset(self):
        return customers.objects.filter(
            assigned_to=self.request.user
        )


class CustomerCreate(LoginRequiredMixin, CreateView):
    model = customers

    fields = [
        'contact_name',
        'opportunity_name',
        'contact_email',
        'contact_phone',
        'money',
        'stage',
        'priority',
    ]

    success_url = reverse_lazy('customers')

    def form_valid(self, form):
        form.instance.assigned_to = self.request.user
        return super().form_valid(form)


class CustomerUpdate(LoginRequiredMixin, UpdateView):
    model = customers

    fields = [
        'contact_name',
        'opportunity_name',
        'contact_email',
        'contact_phone',
        'money',
        'stage',
        'priority',
    ]

    success_url = reverse_lazy('customers')

    def get_queryset(self):
        return customers.objects.filter(
            assigned_to=self.request.user
        )


class CustomLoginView(LoginView):
    template_name = 'base/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse_lazy('launchpad')


# ============================================================
# UPDATE CUSTOMER KANBAN STAGE
# ============================================================

@login_required(login_url='login')
@require_POST
def update_customer_stage(request):
    try:
        data = json.loads(request.body)

        customer_id = data.get('id')
        new_stage = data.get('stage')

        valid_stages = {
            choice[0]
            for choice in customers.STAGE_CHOICES
        }

        if new_stage not in valid_stages:
            return JsonResponse(
                {
                    'status': 'error',
                    'message': 'Invalid customer stage.',
                },
                status=400,
            )

        customer = get_object_or_404(
            customers,
            id=customer_id,
            assigned_to=request.user,
        )

        customer.stage = new_stage
        customer.save(update_fields=['stage'])

        return JsonResponse({
            'status': 'success',
            'message': 'Stage updated.',
        })

    except (json.JSONDecodeError, TypeError):
        return JsonResponse(
            {
                'status': 'error',
                'message': 'Invalid JSON request.',
            },
            status=400,
        )


# ============================================================
# DOCUMENT UPLOADS
# ============================================================

class DocumentUploadForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ['title', 'uploaded_file']


class DocumentListView(LoginRequiredMixin, ListView):
    model = Document
    template_name = 'base/document_list.html'
    context_object_name = 'documents'

    def get_queryset(self):
        return Document.objects.filter(
            Q(uploaded_by=self.request.user)
            | Q(shared_with=self.request.user)
        ).distinct().select_related(
            'uploaded_by',
            'folder',
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['billing_documents'] = (
            BillingDocument.objects
            .filter(created_by=self.request.user)
            .select_related('customer')
            .order_by('-created_at')
        )

        return context


class DocumentUploadView(LoginRequiredMixin, CreateView):
    model = Document
    form_class = DocumentUploadForm
    template_name = 'base/document_form.html'
    success_url = reverse_lazy('document_list')

    def form_valid(self, form):
        document = form.save(commit=False)
        document.uploaded_by = self.request.user
        document.save()

        if (
            self.request.headers.get('x-requested-with')
            == 'XMLHttpRequest'
        ):
            return JsonResponse({
                'status': 'success',
                'file_title': document.title,
                'file_url': document.uploaded_file.url,
                'uploaded_at': document.uploaded_at.strftime(
                    '%b %d, %Y • %H:%M'
                ),
            })

        return redirect(self.success_url)

    def form_invalid(self, form):
        if (
            self.request.headers.get('x-requested-with')
            == 'XMLHttpRequest'
        ):
            return JsonResponse(
                {
                    'status': 'error',
                    'message': form.errors.get_json_data(),
                },
                status=400,
            )

        return super().form_invalid(form)


# ============================================================
# SHARE DOCUMENTS
# ============================================================

@login_required(login_url='login')
@require_POST
def share_document(request):
    try:
        data = json.loads(request.body)

        raw_document_id = data.get('document_id')
        target_username = data.get('username', '').strip()

        try:
            document_id = int(raw_document_id)
        except (TypeError, ValueError):
            return JsonResponse(
                {
                    'status': 'error',
                    'message': 'Invalid document ID.',
                },
                status=400,
            )

        document = get_object_or_404(
            Document,
            id=document_id,
        )

        if document.uploaded_by_id != request.user.id:
            return JsonResponse(
                {
                    'status': 'error',
                    'message': 'Permission denied.',
                },
                status=403,
            )

        recipient = get_object_or_404(
            User,
            username=target_username,
        )

        if recipient.id == request.user.id:
            return JsonResponse(
                {
                    'status': 'error',
                    'message': 'You cannot share a document with yourself.',
                },
                status=400,
            )

        document.shared_with.add(recipient)

        return JsonResponse({
            'status': 'success',
            'message': (
                f'Document shared with {recipient.username}.'
            ),
        })

    except (json.JSONDecodeError, AttributeError):
        return JsonResponse(
            {
                'status': 'error',
                'message': 'Invalid request data.',
            },
            status=400,
        )


# ============================================================
# SEARCH USERS FOR DOCUMENT SHARING
# ============================================================

@login_required(login_url='login')
def search_users_api(request):
    query = request.GET.get('q', '').strip()

    if not query:
        return JsonResponse({'users': []})

    matching_users = User.objects.filter(
        Q(username__icontains=query)
        | Q(first_name__icontains=query)
        | Q(last_name__icontains=query)
    ).exclude(
        id=request.user.id
    )[:8]

    user_list = []

    for user in matching_users:
        full_name = (
            f'{user.first_name} {user.last_name}'
        ).strip()

        user_list.append({
            'username': user.username,
            'full_name': full_name or user.username,
        })

    return JsonResponse({'users': user_list})


# ============================================================
# SALES DASHBOARD
# ============================================================

class SalesDashboardView(LoginRequiredMixin, ListView):
    model = BillingDocument
    template_name = 'base/sales_dashboard.html'
    context_object_name = 'documents'

    def get_queryset(self):
        return (
            BillingDocument.objects
            .filter(created_by=self.request.user)
            .select_related('customer', 'created_by')
            .prefetch_related('items')
            .order_by('-created_at')
        )


# ============================================================
# BILLING FORM HELPERS
# ============================================================

def generate_document_number(doc_type):
    """
    Generate a document number and check that it is unused.
    """

    prefix = 'INV' if doc_type == 'invoice' else 'QT'
    month = timezone.localdate().strftime('%Y%m')

    for _ in range(20):
        number = (
            f'{prefix}-{month}-'
            f'{random.randint(1000, 9999)}'
        )

        if not BillingDocument.objects.filter(
            document_number=number
        ).exists():
            return number

    # Fallback in the unlikely event of repeated collisions.
    from uuid import uuid4

    return f'{prefix}-{month}-{uuid4().hex[:10].upper()}'


def parse_decimal(value, field_name):
    try:
        amount = Decimal(value)
    except (InvalidOperation, TypeError, ValueError):
        raise ValidationError(
            f'{field_name} must be a valid number.'
        )

    if not amount.is_finite():
        raise ValidationError(
            f'{field_name} must be a finite number.'
        )

    if amount < 0:
        raise ValidationError(
            f'{field_name} cannot be negative.'
        )

    if amount.as_tuple().exponent < -2:
        raise ValidationError(
            f'{field_name} cannot have more than two decimal places.'
        )

    return amount


# ============================================================
# CREATE QUOTATION / INVOICE
# ============================================================

class BillingDocumentCreateView(LoginRequiredMixin, CreateView):
    model = BillingDocument
    template_name = 'base/sales_form.html'
    fields = []

    # Retains your existing URL name.
    success_url = reverse_lazy('dashboard')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context.setdefault('cus_param', None)
        context.setdefault('opp_param', None)
        context.setdefault('type_param', 'quotation')

        return context

    def get(self, request, *args, **kwargs):
        customer_id = request.GET.get(
            'from_opp'
        ) or request.GET.get(
            'customer_id'
        ) or request.GET.get(
            'opportunity_id'
        )

        doc_type = request.GET.get('type', 'quotation')

        if doc_type not in {'invoice', 'quotation'}:
            doc_type = 'quotation'

        customer = None

        if customer_id:
            customer = customers.objects.filter(
                id=customer_id,
                assigned_to=request.user,
            ).first()

        context = {
            'cus_param': customer,
            'opp_param': customer,
            'cus': customer,
            'type_param': doc_type,
            'bank_account_choices': (
                BillingDocument.BANK_ACCOUNT_CHOICES
            ),
        }

        return render(
            request,
            self.template_name,
            context,
        )

    def post(self, request, *args, **kwargs):
        # ----------------------------------------------------
        # Read form fields
        # ----------------------------------------------------

        doc_type = request.POST.get(
            'doc_type', 'quotation'
        ).strip()

        client_name = request.POST.get(
            'client_name', ''
        ).strip()

        client_email = request.POST.get(
            'client_email', ''
        ).strip()

        due_date_value = request.POST.get(
            'due_date', ''
        ).strip()

        customer_id = (
            request.POST.get('customer_id')
            or request.POST.get('opportunity_id')
            or request.POST.get('cus_id')
            or ''
        ).strip()

        payment_terms = request.POST.get(
            'payment_terms', ''
        ).strip()

        delivery_date_value = request.POST.get(
            'delivery_date', ''
        ).strip()

        bank_account = request.POST.get(
            'bank_account', ''
        ).strip()

        tax_rate_value = request.POST.get(
            'tax_rate', '16.00'
        ).strip()

        descriptions = request.POST.getlist('desc[]')
        quantities = request.POST.getlist('qty[]')
        prices = request.POST.getlist('price[]')

        errors = []

        # ----------------------------------------------------
        # Validate document information
        # ----------------------------------------------------

        if doc_type not in {'invoice', 'quotation'}:
            errors.append('Select a valid document type.')

        if not client_name:
            errors.append('Client name is required.')

        if len(client_name) > 255:
            errors.append('Client name cannot exceed 255 characters.')

        if not client_email:
            errors.append('Client email is required.')
        else:
            from django.core.validators import validate_email

            try:
                validate_email(client_email)
            except ValidationError:
                errors.append('Enter a valid client email address.')

        due_date = None

        if not due_date_value:
            errors.append('Due date is required.')
        else:
            try:
                due_date = date.fromisoformat(due_date_value)
            except ValueError:
                errors.append('Enter a valid due date.')

        delivery_date = None

        if delivery_date_value:
            try:
                delivery_date = date.fromisoformat(
                    delivery_date_value
                )
            except ValueError:
                errors.append('Enter a valid delivery date.')

        # ----------------------------------------------------
        # Validate bank account
        # ----------------------------------------------------

        valid_bank_accounts = {
            choice[0]
            for choice in BillingDocument.BANK_ACCOUNT_CHOICES
        }

        if doc_type == 'invoice':
            if bank_account not in valid_bank_accounts:
                errors.append(
                    'Select a valid bank account for the invoice.'
                )
        else:
            # Quotations do not require a bank account.
            bank_account = None

        # ----------------------------------------------------
        # Validate tax rate
        # ----------------------------------------------------

        try:
            tax_rate = parse_decimal(
                tax_rate_value,
                'Tax rate',
            )

            if tax_rate > Decimal('100'):
                errors.append('Tax rate cannot exceed 100%.')
        except ValidationError as exc:
            tax_rate = Decimal('16.00')
            errors.append(str(exc))

        # ----------------------------------------------------
        # Validate linked CRM customer
        # ----------------------------------------------------

        customer = None

        if customer_id:
            customer = customers.objects.filter(
                id=customer_id,
                assigned_to=request.user,
            ).first()

            if customer is None:
                errors.append(
                    'The selected customer does not exist '
                    'or is not assigned to your account.'
                )

        # ----------------------------------------------------
        # Validate line items
        # ----------------------------------------------------

        if not descriptions:
            errors.append(
                'Add at least one line item.'
            )

        if not (
            len(descriptions)
            == len(quantities)
            == len(prices)
        ):
            errors.append(
                'The line item data is incomplete. '
                'Please review the form.'
            )

        line_items = []

        for index, description in enumerate(descriptions):
            description = description.strip()

            if not description:
                errors.append(
                    f'Line item {index + 1}: '
                    'description is required.'
                )
                continue

            if len(description) > 255:
                errors.append(
                    f'Line item {index + 1}: '
                    'description cannot exceed 255 characters.'
                )
                continue

            try:
                quantity = int(quantities[index])

                if quantity < 1:
                    raise ValueError
            except (ValueError, TypeError, IndexError):
                errors.append(
                    f'Line item {index + 1}: '
                    'quantity must be a positive whole number.'
                )
                continue

            try:
                unit_price = parse_decimal(
                    prices[index],
                    f'Line item {index + 1} price',
                )

                # BillingItem.unit_price allows 12 digits
                # in total, including 2 decimal places.
                if unit_price >= Decimal('10000000000'):
                    raise ValidationError(
                        f'Line item {index + 1} price is too large.'
                    )

            except (ValidationError, IndexError) as exc:
                errors.append(str(exc))
                continue

            line_items.append({
                'description': description,
                'quantity': quantity,
                'unit_price': unit_price,
            })

        # ----------------------------------------------------
        # Return errors without writing incomplete records
        # ----------------------------------------------------

        if errors:
            return render(
                request,
                self.template_name,
                {
                    'errors': errors,
                    'cus_param': customer,
                    'opp_param': customer,
                    'cus': customer,
                    'type_param': doc_type,
                    'bank_account_choices': (
                        BillingDocument.BANK_ACCOUNT_CHOICES
                    ),
                    'form_data': request.POST,
                },
                status=400,
            )

        # ----------------------------------------------------
        # Save the parent document and items atomically
        # ----------------------------------------------------

        try:
            with transaction.atomic():
                document_number = generate_document_number(
                    doc_type
                )

                parent_doc = BillingDocument.objects.create(
                    doc_type=doc_type,
                    status='draft',
                    document_number=document_number,
                    bank_account=bank_account,
                    customer=customer,
                    created_by=request.user,
                    client_name=client_name,
                    client_email=client_email,
                    tax_rate=tax_rate,
                    due_date=due_date,
                    payment_terms=(
                        payment_terms or None
                        if doc_type == 'quotation'
                        else None
                    ),
                    delivery_date=(
                        delivery_date
                        if doc_type == 'quotation'
                        else None
                    ),
                )

                BillingItem.objects.bulk_create([
                    BillingItem(
                        billing_document=parent_doc,
                        description=item['description'],
                        quantity=item['quantity'],
                        unit_price=item['unit_price'],
                    )
                    for item in line_items
                ])

        except Exception:
            # The exception is re-raised so programming or
            # database errors remain visible in development.
            raise

        return redirect(self.success_url)


# ============================================================
# EXPORT QUOTATION / INVOICE PDF
# ============================================================

@login_required(login_url='login')
def export_billing_pdf(request, doc_id):
    document = get_object_or_404(
        BillingDocument.objects
        .select_related('created_by', 'customer')
        .prefetch_related('items'),
        id=doc_id,
        created_by=request.user,
    )

    buffer = io.BytesIO()

    pdf = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=35,
        bottomMargin=40,
        title=document.document_number,
        author='KAI-SEV LTD',
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'KaiDocumentTitle',
        parent=styles['Heading1'],
        fontSize=22,
        leading=27,
        textColor=colors.HexColor('#003D61'),
        spaceAfter=5,
    )

    meta_style = ParagraphStyle(
        'KaiMeta',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#59656D'),
    )

    normal_style = ParagraphStyle(
        'KaiNormal',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
    )

    story = []

    # --------------------------------------------------------
    # Company logo
    # --------------------------------------------------------

    # Expected file:
    # base/static/images/Logo-KAI.png
    logo_path = (
        settings.BASE_DIR
        / 'base'
        / 'static'
        / 'images'
        / 'Logo-KAI.png'
    )

    if logo_path.exists():
        try:
            logo = Image(
                str(logo_path),
                width=85,
                height=65,
                kind='proportional',
            )

            logo.hAlign = 'LEFT'

            story.append(logo)
            story.append(Spacer(1, 8))

        except Exception:
            # Continue generating the document if the logo
            # file cannot be read.
            pass

    # --------------------------------------------------------
    # Document header
    # --------------------------------------------------------

    story.append(
        Paragraph(
            html.escape(
                document.get_doc_type_display().upper()
            ),
            title_style,
        )
    )

    story.append(
        Paragraph(
            f'<b>KAI-SEV LTD</b>',
            styles['Heading3'],
        )
    )

    story.append(
        Paragraph(
            'Document Number: '
            f'{html.escape(document.document_number)}',
            normal_style,
        )
    )

    story.append(
        Paragraph(
            'Date Issued: '
            f'{timezone.localdate().strftime("%d %B %Y")}',
            normal_style,
        )
    )

    story.append(
        Paragraph(
            'Due Date: '
            f'{document.due_date.strftime("%d %B %Y")}',
            normal_style,
        )
    )

    story.append(Spacer(1, 18))

    # --------------------------------------------------------
    # Customer and issuer information
    # --------------------------------------------------------

    issuer_name = html.escape(
        document.created_by.get_full_name()
        or document.created_by.username
    )

    client_name = html.escape(document.client_name)
    client_email = html.escape(document.client_email)

    meta_data = [[
        Paragraph(
            f'<b>Prepared By</b><br/>{issuer_name}<br/>KAI-SEV LTD',
            meta_style,
        ),
        Paragraph(
            f'<b>Bill To</b><br/>'
            f'{client_name}<br/>{client_email}',
            meta_style,
        ),
    ]]

    meta_table = Table(
        meta_data,
        colWidths=[255, 255],
    )

    meta_table.setStyle(TableStyle([
        (
            'BACKGROUND',
            (0, 0),
            (-1, -1),
            colors.HexColor('#F5F7F8'),
        ),
        ('BOX', (0, 0), (-1, -1), 0.5,
         colors.HexColor('#DCE4E8')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))

    story.append(meta_table)
    story.append(Spacer(1, 22))

    # --------------------------------------------------------
    # Quotation-specific information
    # --------------------------------------------------------

    if document.doc_type == 'quotation':
        payment_terms = html.escape(
            document.payment_terms or 'As agreed'
        )

        delivery_date = (
            document.delivery_date.strftime('%d %B %Y')
            if document.delivery_date
            else 'To be confirmed'
        )

        extras = Table(
            [[
                Paragraph(
                    f'<b>Payment Terms:</b> {payment_terms}',
                    meta_style,
                ),
                Paragraph(
                    '<b>Estimated Delivery:</b> '
                    f'{delivery_date}',
                    meta_style,
                ),
            ]],
            colWidths=[255, 255],
        )

        extras.setStyle(TableStyle([
            (
                'BACKGROUND',
                (0, 0),
                (-1, -1),
                colors.HexColor('#FFF4E9'),
            ),
            ('BOX', (0, 0), (-1, -1), 0.5,
             colors.HexColor('#F58220')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))

        story.append(extras)
        story.append(Spacer(1, 18))

    # --------------------------------------------------------
    # Line items
    # --------------------------------------------------------

    bank_details = document.get_selected_bank_details()

    currency = (
        bank_details.get('currency')
        if bank_details
        else 'KES'
    )

    currency_symbol = (
        'US$' if currency == 'USD' else 'KSh '
    )

    table_data = [[
        'Description',
        'Qty',
        'Unit Price',
        'Total',
    ]]

    for item in document.items.all():
        description = Paragraph(
            html.escape(item.description),
            normal_style,
        )

        table_data.append([
            description,
            str(item.quantity),
            f'{currency_symbol}{item.unit_price:,.2f}',
            f'{currency_symbol}{item.get_total():,.2f}',
        ])

    subtotal = document.get_subtotal()
    tax_amount = document.get_tax_amount()
    grand_total = document.get_grand_total()

    table_data.extend([
        ['', '', 'Subtotal', f'{currency_symbol}{subtotal:,.2f}'],
        [
            '',
            '',
            f'Tax ({document.tax_rate}%)',
            f'{currency_symbol}{tax_amount:,.2f}',
        ],
        [
            '',
            '',
            'Grand Total',
            f'{currency_symbol}{grand_total:,.2f}',
        ],
    ])

    items_table = Table(
        table_data,
        colWidths=[250, 45, 105, 110],
        repeatRows=1,
    )

    items_table.setStyle(TableStyle([
        (
            'BACKGROUND',
            (0, 0),
            (-1, 0),
            colors.HexColor('#003D61'),
        ),
        (
            'TEXTCOLOR',
            (0, 0),
            (-1, 0),
            colors.white,
        ),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        (
            'LINEBELOW',
            (0, 0),
            (-1, -4),
            0.5,
            colors.HexColor('#DCE4E8'),
        ),
        (
            'FONTNAME',
            (2, -3),
            (3, -1),
            'Helvetica-Bold',
        ),
        (
            'BACKGROUND',
            (2, -1),
            (3, -1),
            colors.HexColor('#FFF4E9'),
        ),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))

    story.append(items_table)
    story.append(Spacer(1, 22))

    # --------------------------------------------------------
    # Bank details for invoices
    # --------------------------------------------------------

    if document.doc_type == 'invoice' and bank_details:
        story.append(
            Paragraph('PAYMENT DETAILS', styles['Heading3'])
        )

        bank_rows = [
            ['Bank', bank_details['bank_name']],
            ['Account Name', bank_details['account_name']],
            ['Account Number', bank_details['account_number']],
            ['Branch', bank_details['branch']],
        ]

        if bank_details.get('branch_code'):
            bank_rows.append([
                'Branch Code',
                bank_details['branch_code'],
            ])

        if bank_details.get('currency'):
            bank_rows.append([
                'Currency',
                bank_details['currency'],
            ])

        bank_table = Table(
            bank_rows,
            colWidths=[130, 380],
        )

        bank_table.setStyle(TableStyle([
            (
                'BACKGROUND',
                (0, 0),
                (0, -1),
                colors.HexColor('#F5F7F8'),
            ),
            ('GRID', (0, 0), (-1, -1), 0.4,
             colors.HexColor('#DCE4E8')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ]))

        story.append(bank_table)
        story.append(Spacer(1, 20))

    # --------------------------------------------------------
    # Footer
    # --------------------------------------------------------

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            '<b>Thank you for your business.</b>',
            styles['Normal'],
        )
    )

    story.append(
        Paragraph(
            'For questions about this document, '
            'please contact KAI-SEV LTD.',
            meta_style,
        )
    )

    pdf.build(story)

    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/pdf',
    )

    response['Content-Disposition'] = (
        f'attachment; filename="'
        f'{document.doc_type}_{document.document_number}.pdf"'
    )

    return response