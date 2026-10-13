from decimal import Decimal

from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


# ============================================================
# CUSTOMER / CRM
# ============================================================

class customers(models.Model):

    STAGE_CHOICES = [
        ('new', 'New'),
        ('qualification', 'Qualification'),
        ('proposal', 'Proposal'),
        ('negotiation', 'Negotiation'),
        ('won', 'Closed Won'),
        ('lost', 'Closed Lost'),
    ]

    PRIORITY = [
        ('medium', 'Medium'),
        ('high', 'High'),
        ('very high', 'Very High'),
    ]

    contact_name = models.CharField(max_length=255)
    opportunity_name = models.CharField(max_length=255)
    contact_email = models.EmailField()

    contact_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    money = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )

    stage = models.CharField(
        max_length=50,
        choices=STAGE_CHOICES,
        default='new'
    )

    priority = models.CharField(
        max_length=50,
        choices=PRIORITY,
        blank=True,
        null=True
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='customers',
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.opportunity_name} - {self.contact_name}"

    class Meta:
        ordering = ['-created_at']


# ============================================================
# CUSTOMER DOCUMENT FOLDERS
# ============================================================

class CustomerFolder(models.Model):

    customer = models.ForeignKey(
        customers,
        on_delete=models.CASCADE,
        related_name='document_folders'
    )

    name = models.CharField(max_length=255)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_customer_folders'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['customer', 'name'],
                name='unique_folder_per_customer'
            )
        ]

    def __str__(self):
        return f"{self.customer.opportunity_name} - {self.name}"

    @property
    def document_count(self):
        return self.documents.count()


# ============================================================
# DOCUMENTS
# ============================================================

class Document(models.Model):

    title = models.CharField(max_length=255)

    uploaded_file = models.FileField(
        upload_to='user_documents/'
    )

    folder = models.ForeignKey(
        CustomerFolder,
        on_delete=models.SET_NULL,
        related_name='documents',
        blank=True,
        null=True
    )

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='documents'
    )

    shared_with = models.ManyToManyField(
        User,
        related_name='shared_documents',
        blank=True
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    @property
    def customer(self):
        if self.folder:
            return self.folder.customer
        return None

    class Meta:
        ordering = ['-uploaded_at']


# ============================================================
# BILLING DOCUMENTS
# ============================================================

class BillingDocument(models.Model):

    # --------------------------------------------------------
    # DOCUMENT TYPES
    # --------------------------------------------------------

    DOCUMENT_TYPES = [
        ('quotation', 'Quotation/Estimate'),
        ('invoice', 'Invoice'),
    ]

    # --------------------------------------------------------
    # BANK ACCOUNT OPTIONS
    # --------------------------------------------------------

    BANK_ACCOUNT_CHOICES = [
        ('equity_kes', 'Equity Bank - KES'),
        ('equity_usd', 'Equity Bank - USD'),
        ('ncba', 'NCBA Bank'),
        ('ncba', 'NCBA Bank - USD'),
    ]
    

    # --------------------------------------------------------
    # KAI-SEV LTD BANK DETAILS
    # --------------------------------------------------------

    BANK_DETAILS = {
        'equity_kes': {
            'bank_name': 'Equity Bank',
            'account_name': 'KAI-SEV LTD',
            'account_number': '121111313',
            'branch': 'Kimathi Branch',
            'branch_code': '026',
            'currency': 'KES',
        },

        'equity_usd': {
            'bank_name': 'Equity Bank',
            'account_name': 'KAI-SEV LTD',
            'account_number': '333344444',
            'branch': 'Kimathi Branch',
            'branch_code': '026',
            'currency': 'USD',
        },

        'ncba': {
            'bank_name': 'NCBA Bank',
            'account_name': 'KAI-SEV LTD',
            'account_number': '14141414',
            'branch': 'Harambee Branch',
            'branch_code': None,
            'currency': None,
        },
        'ncba_usd': {
            'bank_name': 'NCBA Bank',
            'account_name': 'KAI-SEV LTD',
            'account_number': '14141414',
            'branch': 'Harambee Branch',
            'branch_code': None,
            'currency': None,
        },
    }

    # --------------------------------------------------------
    # DOCUMENT STATUS
    # --------------------------------------------------------

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent to Client'),
        ('paid', 'Paid/Accepted'),
        ('cancelled', 'Cancelled'),
    ]

    # --------------------------------------------------------
    # DOCUMENT INFORMATION
    # --------------------------------------------------------

    doc_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPES,
        default='quotation'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )

    document_number = models.CharField(
        max_length=50,
        unique=True
    )

    # --------------------------------------------------------
    # SELECTED BANK ACCOUNT
    # --------------------------------------------------------

    bank_account = models.CharField(
        max_length=20,
        choices=BANK_ACCOUNT_CHOICES,
        blank=True,
        null=True,
        help_text='Select a bank account for invoices.'
    )

    # --------------------------------------------------------
    # CUSTOMER
    # --------------------------------------------------------

    customer = models.ForeignKey(
        customers,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='billing_documents'
    )

    # --------------------------------------------------------
    # CREATED BY
    # --------------------------------------------------------

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='billing_documents'
    )

    # --------------------------------------------------------
    # CLIENT SNAPSHOT
    # --------------------------------------------------------

    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()

    # --------------------------------------------------------
    # FINANCIAL INFORMATION
    # --------------------------------------------------------

    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('16.00')
    )

    # --------------------------------------------------------
    # DATES
    # --------------------------------------------------------

    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()

    # --------------------------------------------------------
    # QUOTATION INFORMATION
    # --------------------------------------------------------

    payment_terms = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    delivery_date = models.DateField(
        blank=True,
        null=True
    )

    # --------------------------------------------------------
    # MODEL OPTIONS
    # --------------------------------------------------------

    class Meta:
        ordering = ['-created_at']

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    def clean(self):
        super().clean()

        valid_bank_accounts = {
            choice[0]
            for choice in self.BANK_ACCOUNT_CHOICES
        }

        if self.bank_account and self.bank_account not in valid_bank_accounts:
            raise ValidationError({
                'bank_account': 'Please select a valid bank account.'
            })

        if self.doc_type == 'quotation' and self.bank_account:
            raise ValidationError({
                'bank_account': 'Quotations should not have a bank account.'
            })

        if self.doc_type == 'invoice' and not self.bank_account:
            raise ValidationError({
                'bank_account': 'Please select a bank account for this invoice.'
            })

    # --------------------------------------------------------
    # STRING REPRESENTATION
    # --------------------------------------------------------

    def __str__(self):
        return (
            f"{self.get_doc_type_display()} "
            f"#{self.document_number} - "
            f"{self.client_name}"
        )

    # --------------------------------------------------------
    # FINANCIAL CALCULATIONS
    # --------------------------------------------------------

    def get_subtotal(self):
        return sum(
            (item.get_total() for item in self.items.all()),
            start=Decimal('0.00')
        )

    def get_tax_amount(self):
        return (
            self.get_subtotal() * self.tax_rate
        ) / Decimal('100')

    def get_grand_total(self):
        return self.get_subtotal() + self.get_tax_amount()

    # --------------------------------------------------------
    # BANK ACCOUNT HELPERS
    # --------------------------------------------------------

    def get_selected_bank_details(self):
        """
        Return bank details for the selected invoice account.

        Returns None for quotations or when no account is selected.
        """
        if self.doc_type != 'invoice' or not self.bank_account:
            return None

        return self.BANK_DETAILS.get(self.bank_account)

    def get_bank_account_display_name(self):
        """
        Return the display label of the selected account.
        """
        if not self.bank_account:
            return None

        return self.get_bank_account_display()


# ============================================================
# BILLING ITEMS
# ============================================================

class BillingItem(models.Model):

    billing_document = models.ForeignKey(
        BillingDocument,
        on_delete=models.CASCADE,
        related_name='items'
    )

    description = models.CharField(max_length=255)

    quantity = models.IntegerField(default=1)

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def get_total(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return self.description