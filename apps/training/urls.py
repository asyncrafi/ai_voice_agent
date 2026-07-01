from django.urls import path
from . import views
from apps.dashboard import views as dashboard_views

app_name = 'training'

urlpatterns = [
    # Scripts (also doubles as the difficulty-picker / training-list screen data source)
    path('scripts/', views.TrainingScriptListCreateView.as_view(), name='script-list-create'),
    path('scripts/<int:pk>/', views.TrainingScriptDetailView.as_view(), name='script-detail'),

    # Agent Custom Scripts
    path('agent-scripts/', views.AgentScriptListCreateView.as_view(), name='agent-script-list-create'),
    path('agent-scripts/<int:pk>/', views.AgentScriptDetailView.as_view(), name='agent-script-detail'),

    # Sessions
    path('sessions/', views.TrainingSessionListView.as_view(), name='session-list'),
    path('sessions/start/', views.StartTrainingSessionView.as_view(), name='session-start'),
    path('sessions/<int:pk>/', views.TrainingSessionDetailView.as_view(), name='session-detail'),
    path('sessions/<int:pk>/end/', views.EndTrainingSessionView.as_view(), name='session-end'),

    # Dashboard
    path('dashboard/', views.AgentDashboardView.as_view(), name='agent-dashboard'),

    # Admin Dashboard & Agent Management (mapped under training to match Postman collection)
    path('admin/dashboard/', dashboard_views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/agents/', dashboard_views.AgentTrainerListView.as_view(), name='admin-agent-list'),
    path('admin/agents/<int:pk>/', dashboard_views.AgentTrainerDetailView.as_view(), name='admin-agent-detail'),
    # FIX: was missing entirely — backs the "+ Add Agent" button in Figma
    path('admin/agents/add/', dashboard_views.AddAgentView.as_view(), name='admin-agent-add'),
]