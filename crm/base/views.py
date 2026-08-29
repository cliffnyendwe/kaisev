import json
import random
from datetime import date
from django.db.models import Q
from django import forms
from django.shortcuts import render , redirect
from django.views.generic.list import ListView 
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView , DeleteView
from django.urls import reverse_lazy
from django.http import JsonResponse , HttpResponse
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from .forms import DocumentUploadForm
from django.shortcuts import get_object_or_404

from django.contrib.auth.views import LoginView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User

import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from .models import customers , Document, BillingDocument , BillingItem

# Create your views here.
def export_billing_pdf(request, doc_id):
    # Fetch data safely
    doc = get_object_or_404(BillingDocument, id=doc_id, created_by=request.user )
    
    #Setup standard binary stream buffers
    buffer = io.BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=letter, title=f"{doc.document_number}")
    story = []
    
    # 3. Setup styling sheets
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=24, leading=28, textColor=colors.HexColor('#D35400'))
    meta_style = ParagraphStyle('MetaText', parent=styles['Normal'], fontSize=10, leading=14, textColor=colors.HexColor('#7F8C8D'))
    
    # Header Section
    story.append(Paragraph(f"{doc.get_doc_type_display().upper()}", title_style))
    story.append(Paragraph(f"Document Number: #{doc.document_number}", styles['Heading3']))
    story.append(Spacer(1, 15))
    
    # Meta Information Table Split
    meta_data = [
        [Paragraph(f"<strong>Issued By:</strong><br/>{doc.created_by.username}", meta_style),
         Paragraph(f"<strong>Prepare For:</strong><br/>{doc.client_name}<br/>{doc.client_email}", meta_style)]
    ]
    meta_table = Table(meta_data, colWidths=[250, 250])
    story.append(meta_table)
    story.append(Spacer(1, 30))
    
    # 4. Compile Line Items Grid Data Rows
    table_data = [['Description', 'Quantity', 'Unit Price', 'Total Amount']]
    for item in doc.items.all():
        table_data.append([
            item.description,
            str(item.quantity),
            f"Ksh{item.unit_price:,.2f}",
            f"Ksh{item.get_total():,.2f}"
        ])
        
        
    if doc.doc_type == 'quotation':
        terms_text = doc.payment_terms if doc.payment_terms else "Standard Terms"
        deliv_text = doc.delivery_date.strftime('%B %d, %Y') if doc.delivery_date else "To be confirmed"
        
        quote_extras_data = [
            [Paragraph(f"<strong>Payment Terms:</strong> {terms_text}", meta_style),
             Paragraph(f"<strong>Estimated Delivery:</strong> {deliv_text}", meta_style)]
        ]
        quote_extras_table = Table(quote_extras_data, colWidths=[270, 270])
        
        # Style layout box with a subtle light tint boundary wrapper line
        quote_extras_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FDF6E2')), # Uses your warm cream color token!
            ('PADDING', (0,0), (-1,-1), 8),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#EFEBE4')),
        ]))
        story.append(quote_extras_table)
        story.append(Spacer(1, 20))
    # Append Financial Totals Blocks directly onto the grid footprint boundary
    table_data.append(['', '', 'Subtotal:', f"Ksh{doc.get_subtotal():,.2f}"])
    table_data.append(['', '', f"Tax ({doc.tax_rate}%):", f"Ksh{doc.get_tax_amount():,.2f}"])
    table_data.append(['', '', 'Grand Total:', f"Ksh{doc.get_grand_total():,.2f}"])
    
    # Apply modern billing matrix table formatting
    item_table = Table(table_data, colWidths=[240, 60, 100, 100])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EFEBE4')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#2C3E50')),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
        ('LINEBELOW', (0,0), (-1,-4), 0.5, colors.HexColor('#EFEBE4')),
        ('FONTNAME', (2,-3), (3,-1), 'Helvetica-Bold'),
        ('BACKGROUND', (2,-1), (3,-1), colors.HexColor('#FDF6E2')), # Highlight Grand Total in cream
    ]))
    
    story.append(item_table)
    
    # Footnote Disclaimer Anchor Integration
    story.append(Spacer(1, 40))
    story.append(Paragraph("<font color='#7F8C8D'>Thank you for your business. For queries regarding this invoice, please reach out to the account manager details listed above.</font>", styles['Italic']))
    
    # 5. Build, pack, and export the file binary data stream
    pdf.build(story)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{doc.doc_type}_{doc.document_number}.pdf"'
    return response
    

@login_required(login_url='login/')
def dashboard_hub(request):
    return render(request, 'base/launchpad.html')

class CustomerList(LoginRequiredMixin, ListView):
    model = customers
    context_object_name = 'customers'

    def get_context_data(self, **kwargs):
       context = super().get_context_data(**kwargs)
       context['customers'] = context['customers'].filter(assigned_to=self.request.user)
       
       search_input = self.request.GET.get('search') or ''
       if search_input:
           context['customers'] = context['customers'].filter(
             contact_name__istartswith = search_input
       )
       context['search_input'] = search_input
       return context
        

class CustomerDetail(LoginRequiredMixin, DetailView):
    model = customers
    context_object_name = 'customer'
    template_name = 'base/customer.html'
    
class CustomerCreate(LoginRequiredMixin, CreateView):
    model = customers
    fields = ['contact_name', 'opportunity_name', 'contact_email', 'contact_phone', 'money' , 'stage', 'priority']
    success_url = reverse_lazy('customers')
    
    def form_valid(self, form):
        customer = form.save(commit = False)
        
        customer.assigned_to = self.request.user
        
        customer.save()
        
        return super().form_valid(form)
    
class CustomerUpdate(LoginRequiredMixin, UpdateView):
    model = customers
    fields =  fields = ['contact_name', 'opportunity_name', 'contact_email', 'contact_phone', 'money' , 'stage', 'priority']
    success_url = reverse_lazy('customers')
    
class CustomLoginView(LoginView):
    template_name = 'base/login.html'
    fields = '__all__'
    redirect_authenticated_user = True
    
    def get_success_url(self):
        return reverse_lazy('launchpad')

def update_customer_stage(request):
    if request.method == 'POST':
        try:
            # Parse the background JSON payload sent by JS
          data = json.loads(request.body)
          cus_id = data.get('id')
          new_stage = data.get('stage')
          
          #Fetch , modify , and save the item instantly
          customer = customers.objects.get(id = cus_id)
          customer.stage = new_stage
          customer.save()
          
          return JsonResponse({'status' : 'success', 'message': 'Stage updated.' })
      
        except customers.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Record not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
        
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

#HANDLE DOCUMENTS IN THE KAI-SEV
# 1. Form setup to expose inputs
class DocumentUploadForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ['title', 'uploaded_file']

# 2. File List Drectory View
class DocumentListView(LoginRequiredMixin, ListView):
    model = Document
    template_name ='document_list.html'
    context_object_name = 'documents'
    
    
    def get_queryset(self):
        #Only show documents belonging to the logged-in user
       return super().get_queryset().filter(
           Q(uploaded_by=self.request.user) | Q(shared_with = self.request.user)
           ).distinct()
   
    def get_context_data(self, **kwargs):
       context = super().get_context_data(**kwargs)
       
       #Pull generated invoices and quotatins belonging to the user
       context['billing_documents'] = BillingDocument.objects.filter( created_by=self.request.user)
       return context
   
   
#3. File ingestion Handling Upload View
class DocumentUploadView(LoginRequiredMixin, CreateView):
    model = Document
    form_class = DocumentUploadForm
    template_name = 'document_form.html'
    success_url = reverse_lazy('document_list')
    
    def form_valid(self, form):
        #Intercept, auto-assign the user, and save securely
       document = form.save(commit=False)
       document.uploaded_by = self.request.user
       document.save()
       
       #Check if the request came via Javascript AJAX
       if self.request.headers.get('x-requested-with') == 'XMLHttpRequest':
           #Send back the successful respose tracking attributes
           return JsonResponse({
               'status': 'success',
               'file_title': document.title,
               'file_url': document.uploaded_file.url,
               'uploaded_at': document.uploaded_at.strftime('%b %d, %Y • %H:%M')
           })
           
           #Standard fallback mechanism if user submitted using the traditional backup form layout page        
       return super().form_valid(form)
   
    def form_invalid(self, form):
        if self.request.headers.get('x-requested-with') == 'XMLHttpRequest':
            # Extract form errors cleanly into text arrays
            errors = form.errors.as_json()
            return JsonResponse({'status': 'error', 'message': errors}, status=400)
        return super().form_invalid(form)

def share_document(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            raw_doc_id = data.get('document_id')
            print(raw_doc_id)
            target_username = data.get('username')
            
            #convert Document ID to an integer safely to match db keys
            try:
                doc_id = int(raw_doc_id)
            except (TypeError, ValueError):
                return JsonResponse({'status': 'error', 'message': 'Invalid Document ID format.'}, status=400)
            #Verify the file exists
            document = Document.objects.get(id=doc_id)
            print(document)
            
            #Security Check : Ensure ONLY the original uploader can share it
            if document.uploaded_by != request.user:
                return JsonResponse({'status': 'error', 'message': 'Permission denied.'}, status=403)
            
            #Verify the recipient teammate exists in the system
            recipient = User.objects.get(username=target_username)
            
            if recipient == request.user:
                return JsonResponse({'status': 'error', 'message':'You cannot share a file with yourself.'}, status=400)
            
            
            #3. Add relation link and save parameters
            document.shared_with.add(recipient)
            document.save()
            print(f"success: File share with {target_username}!")
            
            return JsonResponse({'status': 'success','message': f'Document shared with {target_username}!'})
        except Document.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Document not found.'}, status=404)
        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User profile username not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

@login_required
def search_users_api(request):
    query = request.GET.get('q', '').strip()
    
    if len(query) < 1:
        return JsonResponse({'users': []})
    
    #Find users whose username starts with or contains the typed keyword query
    
    #Excluded the currently logged in user account so they cant select themselves
    matching_users = User.objects.filter(
        username__icontains = query
    ).exclude(id=request.user.id)[:8] #Limits result output to top 8 list rows for speed
    
    user_list = []
    for u in matching_users:
     user_list.append({
        'username': u.username,
        'full_name': f'{u.first_name} {u.last_name}'.strip() or u.username
    })
     
    return JsonResponse({'users' : user_list})

class SalesDashboardView(LoginRequiredMixin, ListView):
    model = BillingDocument
    template_name = 'base/sales_dashboard.html'
    context_object_name = 'documents'
    
    def get_queryset(self):
        #Security Guadrail: Only show financials belonging to this logged-in account
        return super().get_queryset().filter(created_by=self.request.user)

class BillingDocumentCreateView(LoginRequiredMixin, CreateView):
    model = BillingDocument
    template_name = 'base/sales_form.html'
    fields = [] # Excluded default mapping because we process custom dynamic fields manually
    success_url = reverse_lazy('dashboard')

    # Intercept view to populate conversion context fields if triggered via Kanban
    def get(self, request, *args, **kwargs):
        cus_id = request.GET.get('from_opp')
        type_param = request.GET.get('type', 'quotation')
        cus_param = None
        
        if cus_id:
            try:
                opp_param = customers.objects.get(id=cus_id, assigned_to=request.user)
            except customers.DoesNotExist:
                pass
                
        return render(request, self.template_name, {
            'cus_param': cus_param,
            'type_param': type_param
        })

    def post(self, request, *args, **kwargs):
        # 1. Unpack arrays from form submission
        descriptions = request.POST.getlist('desc[]')
        quantities = request.POST.getlist('qty[]')
        prices = request.POST.getlist('price[]')
        
        doc_type = request.POST.get('doc_type')
        due_date = request.POST.get('due_date')
        client_name = request.POST.get('client_name')
        client_email = request.POST.get('client_email')
        cus_id = request.POST.get('customer_id')
        
        payment_terms = request.POST.get('payment_terms') if doc_type == 'quotation' else None
        delivery_date = request.POST.get('delivery_date') if doc_type == 'quotation' else None
        
        if delivery_date == "": delivery_date = None 
        
        # 2. Automatically compile a randomized tracking code signature block string
        doc_prefix = "INV" if doc_type == 'invoice' else "QT"
        unique_num = f"{doc_prefix}-{date.today().strftime('%Y%m')}-{random.randint(1000, 9999)}"

        # 3. Save Parent document row entry
        parent_doc = BillingDocument.objects.create(
            doc_type=doc_type,
            document_number=unique_num,
            client_name=client_name,
            client_email=client_email,
            due_date=due_date,
            created_by=request.user,
            customer_id=cus_id if cus_id else None,
            payment_terms = payment_terms,
            delivery_date = delivery_date
        )

        # 4. Loop array indexes and insert individual item matrix records
        for i in range(len(descriptions)):
            BillingItem.objects.create(
                billing_document=parent_doc,
                description=descriptions[i],
                quantity=int(quantities[i]),
                unit_price=float(prices[i])
            )

        return redirect(self.success_url)