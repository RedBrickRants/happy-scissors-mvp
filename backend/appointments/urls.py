from django.urls import path
from . import views

urlpatterns = [
    path('', views.appointment_list, name='appointment-list'),
    path('make/', views.make_appointment, name='make-appointment'),
    path('<int:pk>/', views.update_appointment, name='update-appointment'),
]