import { Component, signal, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, Chart, registerables } from 'chart.js';
import { StatisticsService } from '../../core/services/statistics';
import { ChatbotWidgetComponent } from '../../shared/chatbot-widget/chatbot-widget';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, TranslateModule, BaseChartDirective, ChatbotWidgetComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private statisticsService = inject(StatisticsService);
  private cdr = inject(ChangeDetectorRef);
  currentDate = new Date();

  // Loading states
  loadingCharts = signal(true);
  loadingQCM = signal(true);
  loadingRegistrations = signal(true);
  error = signal<string | null>(null);

  // Active period filter for registrations
  registrationPeriod = signal<'day' | 'week' | 'month'>('month');

  // KPIs
  kpis = [
    {
      title: 'Total Utilisateurs',
      value: 0 as number | string,
      change: '',
      trend: 'up',
      icon: 'fas fa-users',
      color: 'primary'
    },
    {
      title: 'Cours Publiés',
      value: 0 as number | string,
      change: '',
      trend: 'up',
      icon: 'fas fa-book-open',
      color: 'success'
    },
    {
      title: 'QCM Complétés',
      value: 0 as number | string,
      change: '',
      trend: 'up',
      icon: 'fas fa-clipboard-check',
      color: 'warning'
    },
    {
      title: 'Taux de Réussite',
      value: '0%' as number | string,
      change: '',
      trend: 'up',
      icon: 'fas fa-chart-line',
      color: 'info'
    }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loadingCharts.set(true);
    this.loadingQCM.set(true);
    this.loadingRegistrations.set(true);
    this.error.set(null);

    // Load admin statistics
    this.statisticsService.getAdminStats().subscribe({
      next: (stats) => {
        this.kpis[0].value = stats.users.total;
        this.kpis[1].value = stats.courses.published;
        this.kpis[2].value = stats.qcm.total_results;
        this.kpis[3].value = stats.qcm.pass_rate + '%';
        this.userTypesChartData = {
          ...this.userTypesChartData,
          datasets: [{
            ...this.userTypesChartData.datasets[0],
            data: [stats.users.apprenants, stats.users.formateurs, stats.users.admins]
          }]
        };
        this.loadingCharts.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des statistiques');
        this.loadingCharts.set(false);
        this.cdr.detectChanges();
      }
    });

    // Load QCM pass rates
    this.loadQCMPassRates();

    // Load user registrations
    this.loadUserRegistrations();
  }

  private loadQCMPassRates(): void {
    this.loadingQCM.set(true);
    this.statisticsService.getQCMPassRates().subscribe({
      next: (response) => {
        const qcms = response.qcms || [];
        const labels = qcms.map(q => q.title);
        const data = qcms.map(q => q.pass_rate);

        this.qcmChartData = {
          labels: labels,
          datasets: [
            {
              label: 'Taux de réussite (%)',
              data: data,
              backgroundColor: [
                'rgba(21, 101, 192, 0.8)',
                'rgba(46, 125, 50, 0.8)',
                'rgba(255, 111, 0, 0.8)',
                'rgba(0, 151, 167, 0.8)',
                'rgba(123, 31, 162, 0.8)',
                'rgba(230, 124, 115, 0.8)',
                'rgba(63, 81, 181, 0.8)',
                'rgba(255, 193, 7, 0.8)'
              ],
              borderRadius: 8
            }
          ]
        };
        this.loadingQCM.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des taux QCM', err);
        this.loadingQCM.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  private loadUserRegistrations(): void {
    this.loadingRegistrations.set(true);
    this.statisticsService.getUserRegistrations(this.registrationPeriod()).subscribe({
      next: (response) => {
        const labels = response.labels || [];
        const data = response.data || [];

        this.usersChartData = {
          labels: labels,
          datasets: [
            {
              label: 'Nouveaux utilisateurs',
              data: data,
              borderColor: '#1565c0',
              backgroundColor: 'rgba(21, 101, 192, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        };
        this.loadingRegistrations.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des inscriptions', err);
        this.loadingRegistrations.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  changePeriod(period: 'day' | 'week' | 'month'): void {
    this.registrationPeriod.set(period);
    this.loadUserRegistrations();
  }

  // Quick actions
  quickActions = [
    { label: 'Créer un QCM', icon: 'fas fa-clipboard-list', route: '/admin/qcm/create', color: 'btn-success' },
    { label: 'Gérer utilisateurs', icon: 'fas fa-user-cog', route: '/admin/users', color: 'btn-warning' },
    { label: 'Voir documents', icon: 'fas fa-file-pdf', route: '/admin/documents', color: 'btn-info' }
  ];

  // Users line chart config
  usersChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Nouveaux utilisateurs',
        data: [],
        borderColor: '#1565c0',
        backgroundColor: 'rgba(21, 101, 192, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  usersChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // QCM results bar chart
  qcmChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Taux de réussite (%)',
        data: [],
        backgroundColor: [],
        borderRadius: 8
      }
    ]
  };

  qcmChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  // User types doughnut chart
  userTypesChartData: ChartData<'doughnut'> = {
    labels: ['Apprenants', 'Formateurs', 'Administrateurs'],
    datasets: [
      {
        data: [1150, 85, 13],
        backgroundColor: [
          '#1565c0',
          '#ff6f00',
          '#2e7d32'
        ],
        borderWidth: 0
      }
    ]
  };

  userTypesChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  // Calcul dynamique du total des utilisateurs
  getTotalUsers(): number {
    const data = this.userTypesChartData.datasets[0]?.data as number[];
    return data ? data.reduce((sum, value) => sum + value, 0) : 0;
  }
}
