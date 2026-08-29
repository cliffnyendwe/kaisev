from django.contrib import admin
from .models import customers , Document, BillingDocument ,BillingItem

# Register your models here.
admin.site.register([customers, Document, BillingDocument, BillingItem])