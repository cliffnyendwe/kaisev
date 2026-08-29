from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import CustomerList , CustomerDetail, CustomerCreate, CustomerUpdate, CustomLoginView
from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
    path('', views.dashboard_hub, name='launchpad'),
    path('customers/' , CustomerList.as_view(), name='customers'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),
    path('customer/<int:pk>', CustomerDetail.as_view(), name='customer'),
    path('customer-create/', CustomerCreate.as_view(), name = 'customer-create'),
    path('customer-update/<int:pk>', CustomerUpdate.as_view(), name='customer-update'),
    path('login/' , CustomLoginView.as_view(), name='login'),
    path('update-stage/', views.update_customer_stage, name='update_stage'),
    
    # NEW DOCUMENT SYSTEM ROUTES
    path('documents/', views.DocumentListView.as_view(), name='document_list'),
    path('documents/upload/', views.DocumentUploadView.as_view(), name='document_upload'),
    path('documents/share/', views.share_document, name='share_document'),
    path('users/search/', views.search_users_api, name='search_users_api'),
    
    #PATH TO SALES AND ACC
    path('sales/', views.SalesDashboardView.as_view(), name='dashboard'),
    path('sales/export/<int:doc_id>/', views.export_billing_pdf, name='export_billing_pdf'),
    path('sales/issue/', views.BillingDocumentCreateView.as_view(), name='sales_issue')
]


# CRITICAL FOR FILE ACCESS: Serves media files during local development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)