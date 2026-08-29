from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class customers(models.Model):
    #Setup your choices for the Kanban board stages
    STAGE_CHOICES = [
        ('new' , 'New'),
        ('qualification' , 'Qualification'),
        ('proposal' , 'Proposal'),
        ('negotiation' , 'Negotiation'),
        ('won' , 'Closed Won'),
        ('lost' , 'Closed Lost'),
    ]
    
    PRIORITY = [
        ('medium' , 'Medium'),
        ('high' , 'High'),
        ('very high' , 'Very  High'),
    ]
    contact_name = models.CharField(max_length=255)
    opportunity_name = models.CharField(max_length=255)
    
    #Buil-in validation fields for emails and phone number.
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    #DecimalField is best for money/currency to avoid rounding errors
    money = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Kanban stage field with 'new' set as the default
    stage = models.CharField(
        max_length=50,
        choices=STAGE_CHOICES,
        default='new'
    )
    
    priority = models.CharField(
        max_length = 50,
        choices = PRIORITY,
        blank = True,
        null = True
    
    )
    
    assigned_to = models.ForeignKey(
        User,
        on_delete = models.CASCADE,
        related_name = "customers",
        blank=True,
        null=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    
    def __str__(self):
        return f"{self.opportunity_name} - {self.contact_name}" 
    
    class Meta:
        ordering = ['-created_at']

class Document(models.Model):
    title = models.CharField(max_length=255)
    
    #Files will be uploaded to a subfolder named 'user_documents/' inside your media directory
    uploaded_file = models.FileField(upload_to = 'user_documents/')
    
    #Auto-track creation timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    #Secure ownership tracking
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
    
    def __str__(self):
        return f"{self.title}"
    
    class Meta:
        ordering = ['-uploaded_at']
        
class BillingDocument(models.Model):
    DOCUMENT_TYPES = [
        ('quotation', 'Quotation/Estimate'),
        ('invoice', 'Invoice'),
    ]
    
    STATUS_CHOICES = [
        ('draft',  'Draft'),
        ('sent',  'Sent to Client'),
        ('paid',  'Paid/Accepted'),
        ('cancelled',  'Cancelled'),
    ]
    
    doc_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, default='quotation' )
    status= models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    document_number = models.CharField(max_length=50, unique=True)
    
    #Relationships
    customer = models.ForeignKey(customers, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    #client Meta Snapshots (Keeps data safe if the original contact details change)
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    
    #Finacial Aggregations
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=16.00)
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    
    payment_terms = models.CharField(
        max_length = 255,
        blank = True,
        null = True      
    )
    
    delivery_date = models.DateField(blank= True, null = True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.get_doc_type_display()} #{self.document_number} - {self.client_name}"
    
    #Calculated calculations safely on the python layer to avoid rounding gliteches
    def get_subtotal(self):
        return sum(item.get_total() for item in self.items.all())
        
    def get_tax_amount(self):
        return (self.get_subtotal() * self.tax_rate) / 100
    
    def get_grand_total(self):
       return self.get_subtotal() + self.get_tax_amount()
   
class BillingItem(models.Model):
    #Links multiple items straight to one main parent billing document sheet
    billing_document = models.ForeignKey(BillingDocument, on_delete=models.CASCADE, related_name ='items')
    description = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    
    def get_total(self):
        return self.quantity * self.unit_price
    
    def __str__(self):
        return self.description