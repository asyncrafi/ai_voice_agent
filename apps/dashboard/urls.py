from django.urls import path
from . import views

urlpatterns = [
    path('admin/dashboard/', views.AdminDashboardView.as_view()),
    path('admin/agents/', views.AgentTrainerListView.as_view()),
    path('admin/agents/<int:pk>/',views.AgentTrainerDetailView.as_view()),
]
