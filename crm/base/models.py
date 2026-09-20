from django.db import models
from django.contrib.auth.models import User


# ============================================================
# CUSTOMER / CRM
# ============================================================

class customers(models.Model):

    # Kanban board stages
    STAGE_CHOICES = [
        ('new', 'New'),
        ('qualification', 'Qualification'),
        ('proposal', 'Proposal'),
        ('negotiation', 'Negotiation'),
        ('won', 'Closed Won'),
        ('lost', 'Closed Lost'),
    ]

    # Customer priority
    PRIORITY = [
        ('medium', 'Medium'),
        ('high', 'High'),
        ('very high', 'Very High'),
    ]

    contact_name = models.CharField(
        max_length=255
    )

    opportunity_name = models.CharField(
        max_length=255
    )

    contact_email = models.EmailField()

    contact_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    # Money / opportunity value
    money = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00
    )

    # Kanban stage
    stage = models.CharField(
        max_length=50,
        choices=STAGE_CHOICES,
        default='new'
    )

    # Priority
    priority = models.CharField(
        max_length=50,
        choices=PRIORITY,
        blank=True,
        null=True
    )

    # User responsible for the customer
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='customers',
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.opportunity_name} - {self.contact_name}"

    class Meta:
        ordering = ['-created_at']


# ============================================================
# CUSTOMER DOCUMENT FOLDERS
# ============================================================

class CustomerFolder(models.Model):

    """
    A folder belonging to a specific customer.

    Example:

        Customer: ABC Ltd
            ├── Contracts
            ├── Quotations
            ├── Invoices
            └── General
    """

    customer = models.ForeignKey(
        customers,
        on_delete=models.CASCADE,
        related_name='document_folders'
    )

    name = models.CharField(
        max_length=255
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_customer_folders'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

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

    title = models.CharField(
        max_length=255
    )

    # Physical uploaded file
    uploaded_file = models.FileField(
        upload_to='user_documents/'
    )

    # Customer folder
    #
    # SET_NULL means deleting a folder will NOT delete
    # the documents inside it.
    folder = models.ForeignKey(
        CustomerFolder,
        on_delete=models.SET_NULL,
        related_name='documents',
        blank=True,
        null=True
    )

    # User who uploaded the document
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='documents'
    )

    # Users who have access to the document
    shared_with = models.ManyToManyField(
        User,
        related_name='shared_documents',
        blank=True
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title

    @property
    def customer(self):
        """
        Allows:

            document.customer

        to return the customer associated with
        the document's folder.
        """
        if self.folder:
            return self.folder.customer

        return None

    class Meta:
        ordering = ['-uploaded_at']


# ============================================================
# BILLING DOCUMENTS
# ============================================================

class BillingDocument(models.Model):

    DOCUMENT_TYPES = [
        ('quotation', 'Quotation/Estimate'),
        ('invoice', 'Invoice'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent to Client'),
        ('paid', 'Paid/Accepted'),
        ('cancelled', 'Cancelled'),
    ]

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

    # Customer associated with the quotation/invoice
    customer = models.ForeignKey(
        customers,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='billing_documents'
    )

    # User who created the quotation/invoice
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='billing_documents'
    )

    # Client snapshot
    #
    # These values are deliberately stored separately from
    # the customer record so that historical invoices remain
    # accurate if customer information changes later.
    client_name = models.CharField(
        max_length=255
    )

    client_email = models.EmailField()

    # Financial information
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=16.00
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    due_date = models.DateField()

    payment_terms = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    delivery_date = models.DateField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ['-created_at']

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
            item.get_total()
            for item in self.items.all()
        )

    def get_tax_amount(self):
        return (
            self.get_subtotal() * self.tax_rate
        ) / 100

    def get_grand_total(self):
        return (
            self.get_subtotal()
            + self.get_tax_amount()
        )


# ============================================================
# BILLING ITEMS
# ============================================================

class BillingItem(models.Model):

    # Parent quotation/invoice
    billing_document = models.ForeignKey(
        BillingDocument,
        on_delete=models.CASCADE,
        related_name='items'
    )

    description = models.CharField(
        max_length=255
    )

    quantity = models.IntegerField(
        default=1
    )

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def get_total(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return self.description
