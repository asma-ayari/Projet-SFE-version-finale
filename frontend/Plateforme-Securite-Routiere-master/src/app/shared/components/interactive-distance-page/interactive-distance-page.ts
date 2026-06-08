import { Component, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interactive-distance-page',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="lesson-page interactive-page">
  <div class="lesson-content">
    <div class="page-header-badge">Page 5 / 6</div>
    
    <h1 class="question-title">Observation des distances par vitesse</h1>

    <!-- Intro Text -->
    <div class="intro-text">
      <p>Sélectionnez une vitesse pour observer la distance parcourue pendant le temps de réaction et la distance de freinage.</p>
    </div>

    <!-- Speed Buttons -->
    <div class="speed-buttons-grid">
      @for (speed of speeds; track speed) {
        <button 
          class="speed-btn" 
          [class.active]="selectedSpeed() === speed"
          (click)="selectSpeed(speed)">
          {{ speed }} km/h
        </button>
      }
    </div>

    <!-- Legend -->
    <div class="legend-bar">
      <div class="legend-item">
        <div class="legend-color orange"></div>
        <span>Temps de réaction</span>
      </div>
      <div class="legend-item">
        <div class="legend-color pink"></div>
        <span>Distance de freinage</span>
      </div>
    </div>

    <!-- Visual Bar -->
    <div class="distance-visualization-box">
      <div class="distance-container">
        <div class="distance-bar-wrapper">
          <div class="start-section">
            <div class="car-icon">🚗</div>
            <span class="start-text">0 m</span>
          </div>
          <div class="segments-container">
            <div class="distance-segment reaction-segment" [style.flex]="reactionPercent() + '%'">
              <span class="segment-label">{{ currentData().reaction }} m</span>
            </div>
            <div class="distance-segment braking-segment" [style.flex]="brakingPercent() + '%'">
              <span class="segment-label">{{ currentData().braking.toFixed(1) }} m</span>
            </div>
          </div>
          <div class="end-section">
            <div class="stop-icon">🛑</div>
            <span class="end-text">{{ currentData().total }} m</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="data-table-section">
      <table class="speed-data-table">
        <thead>
          <tr>
            <th>Vitesse</th>
            <th>Temps de réaction</th>
            <th>Distance de freinage</th>
            <th>Distance totale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>{{ selectedSpeed() }} km/h</strong></td>
            <td>0 → {{ currentData().reaction }} m</td>
            <td>{{ currentData().reaction }} → {{ currentData().total }} m</td>
            <td><strong>{{ currentData().total }} m</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="lesson-footer modern-nav">
    <div class="nav-buttons-container">
      <button class="btn-nav-prev">
        <span class="arrow">‹</span>
        <span class="text">Page précédente</span>
      </button>
      <button class="btn-nav-next">
        <span class="text">Page suivante</span>
        <span class="arrow">›</span>
      </button>
    </div>
    <div class="pagination">
      <button class="page-btn">1</button>
      <button class="page-btn">2</button>
      <button class="page-btn">3</button>
      <button class="page-btn">4</button>
      <button class="page-btn active">5</button>
      <button class="page-btn">6</button>
    </div>
  </div>
</div>
  `,
  styles: [`
    .lesson-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .page-header-badge {
      display: inline-block;
      padding: 0.6rem 1.2rem;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
      color: white;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      width: fit-content;
      margin-bottom: 1rem;
    }

    .question-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 1.5rem 0;
    }

    .intro-text {
      font-size: 1rem;
      color: #666;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .intro-text p {
      margin: 0;
    }

    /* Speed Buttons */
    .speed-buttons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .speed-btn {
      padding: 0.85rem 1rem;
      border: 2px solid #ddd;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      color: #333;
    }

    .speed-btn:hover {
      border-color: #999;
      background: #f5f5f5;
      transform: translateY(-2px);
    }

    .speed-btn.active {
      background: #c41e3a;
      color: white;
      border-color: #c41e3a;
      box-shadow: 0 4px 12px rgba(196, 30, 58, 0.3);
    }

    /* Legend */
    .legend-bar {
      display: flex;
      gap: 2rem;
      padding: 1rem 1.5rem;
      background: #f5f5f5;
      border-radius: 10px;
      margin-bottom: 2rem;
      justify-content: center;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
      color: #666;
    }

    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }

    .legend-color.orange {
      background: #F5A623;
    }

    .legend-color.pink {
      background: #E91E8C;
    }

    /* Distance Visualization */
    .distance-visualization-box {
      background: #1a2a4a;
      border-radius: 16px;
      padding: 2rem;
      color: white;
      margin-bottom: 2rem;
    }

    .distance-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .distance-bar-wrapper {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      justify-content: flex-start;
    }

    .start-section,
    .end-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      min-width: 70px;
      text-align: center;
    }

    .car-icon,
    .stop-icon {
      font-size: 2.5rem;
    }

    .start-text,
    .end-text {
      font-weight: 700;
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .segments-container {
      display: flex;
      gap: 0;
      align-items: center;
      height: 50px;
    }

    .distance-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 0.95rem;
      transition: flex 0.6s ease;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      min-width: 50px;
      padding: 0 1rem;
    }

    .reaction-segment {
      background: #F5A623;
      border-radius: 12px 0 0 12px;
      flex: 0 1 auto;
    }

    .braking-segment {
      background: #E91E8C;
      border-radius: 0 12px 12px 0;
      flex: 0 1 auto;
    }

    .segment-label {
      font-weight: 700;
      font-size: 0.95rem;
      white-space: nowrap;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    /* Data Table */
    .data-table-section {
      margin-top: 2rem;
    }

    .speed-data-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .speed-data-table thead {
      background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
      border-bottom: 2px solid #ddd;
    }

    .speed-data-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 700;
      color: #1a1a2e;
      font-size: 0.95rem;
    }

    .speed-data-table td {
      padding: 1rem;
      border-bottom: 1px solid #eee;
      color: #333;
      font-size: 0.95rem;
    }

    .speed-data-table tbody tr:hover {
      background: #fafafa;
    }

    .speed-data-table tbody tr:last-child td {
      border-bottom: none;
    }

    /* Footer */
    .lesson-footer {
      margin-top: 2rem;
    }

    .modern-nav {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding-top: 2rem;
      border-top: 1px solid #ddd;
    }

    .nav-buttons-container {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
    }

    .btn-nav-prev,
    .btn-nav-next {
      flex: 1;
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-nav-prev {
      background: #F5A623;
      color: white;
    }

    .btn-nav-prev:hover {
      background: #e89a1d;
      transform: translateY(-2px);
    }

    .btn-nav-next {
      background: #2196F3;
      color: white;
    }

    .btn-nav-next:hover {
      background: #1976D2;
      transform: translateY(-2px);
    }

    .arrow {
      font-size: 1.5rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
    }

    .page-btn {
      width: 40px;
      height: 40px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .page-btn:hover {
      border-color: #999;
      background: #f5f5f5;
    }

    .page-btn.active {
      background: #2196F3;
      color: white;
      border-color: #2196F3;
    }

    @media (max-width: 768px) {
      .speed-buttons-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .legend-bar {
        gap: 1rem;
        flex-direction: column;
      }

      .distance-bar {
        height: 60px;
      }

      .question-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class InteractiveDistancePageComponent implements AfterViewInit {
  speeds = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];
  
  selectedSpeed = signal(70);

  private speedDataMap = {
    30: { reaction: 8.5, braking: 4.5, total: 13 },
    40: { reaction: 12, braking: 8, total: 20 },
    50: { reaction: 15, braking: 12, total: 27 },
    60: { reaction: 17.5, braking: 17.5, total: 35 },
    70: { reaction: 20.5, braking: 24, total: 44.5 },
    80: { reaction: 23, braking: 31.5, total: 54.5 },
    90: { reaction: 26, braking: 39.5, total: 65.5 },
    100: { reaction: 29, braking: 49, total: 78 },
    110: { reaction: 31.5, braking: 59.7, total: 91.2 },
    120: { reaction: 34.5, braking: 70.5, total: 105 },
    130: { reaction: 37.5, braking: 82.5, total: 120 }
  };

  currentData = computed(() => {
    const speed = this.selectedSpeed() as keyof typeof this.speedDataMap;
    return this.speedDataMap[speed];
  });

  reactionPercent = computed(() => {
    const data = this.currentData();
    const total = data.reaction + data.braking;
    return (data.reaction / total) * 100;
  });

  brakingPercent = computed(() => {
    const data = this.currentData();
    const total = data.reaction + data.braking;
    return (data.braking / total) * 100;
  });

  selectSpeed(speed: number) {
    this.selectedSpeed.set(speed);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setupPaginationEvents();
    }, 100);
  }

  private setupPaginationEvents() {
    const prevBtn = document.querySelector('.btn-nav-prev');
    const nextBtn = document.querySelector('.btn-nav-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        // Handle previous page navigation
        console.log('Previous page clicked');
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        // Handle next page navigation
        console.log('Next page clicked');
      });
    }
  }
}
