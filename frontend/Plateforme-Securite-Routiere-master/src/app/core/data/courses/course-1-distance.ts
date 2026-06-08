import { CourseContent } from '../../../core/services/course-content.service';

export const COURSE_1_DISTANCE_ARRET: CourseContent = {
  id: 1,
  title: 'Distance d\'arrêt',
  icon: '📏',
  category: 'Sécurité',
  duration: '45 min',
  description: 'Comprendre les distances de freinage et d\'arrêt selon la vitesse et les conditions. Un cours essentiel pour la sécurité routière.',
  totalPages: 6,
  lessons: [
    {
      lessonNumber: 1,
      title: '',
      content: `
<div class="lesson-page simple">
  <!-- CONTENT SECTION -->
  <div class="lesson-content">
    <span class="page-badge">Page 1 / 6</span>
    
    <h1 class="question-title">Pourquoi faut-il laisser de l'espace pour s'arrêter ?</h1>

    <!-- DIAGRAM SECTION -->
    <div class="diagram-section">
      <div class="car-icon">🚗</div>
      <div class="diagram-label">Zone de freinage</div>
    </div>

    <!-- OBJECTIVES SECTION -->
    <div class="objectives-section">
      <h3 class="objectives-title">Objectifs de cette leçon :</h3>
      <ul class="objectives-list">
        <li class="objective-item">
          <span class="objective-checkmark">✓</span>
          Comprendre les composantes de la distance d'arrêt
        </li>
        <li class="objective-item">
          <span class="objective-checkmark">✓</span>
          Identifier les facteurs influençant le freinage
        </li>
        <li class="objective-item">
          <span class="objective-checkmark">✓</span>
          Calculer la distance d'arrêt à différentes vitesses
        </li>
      </ul>
    </div>
  </div>

  <!-- FOOTER SECTION -->
  <div class="lesson-footer">
    <div class="nav-buttons-container">
      <button class="btn-nav-prev" disabled>
        <span class="arrow">‹</span>
        <span class="text">Page précédente</span>
      </button>
      <button class="btn-nav-next">
        <span class="text">Page suivante</span>
        <span class="arrow">›</span>
      </button>
    </div>
    <div class="pagination">
      <button class="page-btn active">1</button>
      <button class="page-btn">2</button>
      <button class="page-btn">3</button>
      <button class="page-btn">4</button>
      <button class="page-btn">5</button>
      <button class="page-btn">6</button>
    </div>
  </div>
</div>
      `
    },
    {
      lessonNumber: 2,
      title: 'Selectionnez une vitesse',
      content: `
<div class="lesson-page simple">
  <div class="lesson-content">
    <span class="page-badge">Page 2 / 6</span>
    
    <h1 class="question-title">Sélectionnez une vitesse</h1>

    <div class="lesson-text">
      <p>Vous êtes attentif, votre voiture est en bon état, la route est sèche. Soudain, vous apercevez un obstacle sur la route et freinez en urgence. <strong>Où va s'arrêter votre véhicule ?</strong></p>
      
      <div class="speed-buttons-container">
        <button class="speed-btn" data-speed="30">30 km/h</button>
        <button class="speed-btn" data-speed="40">40 km/h</button>
        <button class="speed-btn" data-speed="50">50 km/h</button>
        <button class="speed-btn" data-speed="60">60 km/h</button>
        <button class="speed-btn" data-speed="70">70 km/h</button>
        <button class="speed-btn" data-speed="80">80 km/h</button>
        <button class="speed-btn" data-speed="90">90 km/h</button>
        <button class="speed-btn" data-speed="100">100 km/h</button>
        <button class="speed-btn" data-speed="110">110 km/h</button>
        <button class="speed-btn" data-speed="120">120 km/h</button>
        <button class="speed-btn" data-speed="130">130 km/h</button>
      </div>

      <div class="distance-time-results">
        <div class="result-item">
          <div class="result-icon">📍</div>
          <div class="result-content">
            <div class="result-label">Distance d'arrêt</div>
            <div class="result-value" id="distanceValue">26.2 m</div>
          </div>
        </div>
        <div class="result-item">
          <div class="result-icon">⏱️</div>
          <div class="result-content">
            <div class="result-label">Temps d'arrêt</div>
            <div class="result-value" id="timeValue">2.8 s</div>
          </div>
        </div>
      </div>

      <div class="car-diagram-container">
        <div class="car-icon">🚗</div>
        <div class="distance-bar">
          <div class="distance-indicator" id="distanceIndicator" style="width: 22%;">
            <span id="distanceInBar" style="color: white; font-weight: 700;">26.2 m</span>
          </div>
        </div>
        <div class="warning-icon">⚠️</div>
      </div>

      <div class="info-box">
        <p id="selectedSpeedInfo">À 50 km/h, il faut 26.2 mètres et 2.8 secondes pour arrêter son véhicule.</p>
      </div>
    </div>
  </div>

  <div class="lesson-footer">
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
      <button class="page-btn active">2</button>
      <button class="page-btn">3</button>
      <button class="page-btn">4</button>
      <button class="page-btn">5</button>
      <button class="page-btn">6</button>
    </div>
  </div>
</div>

<style>
.speed-buttons-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin: 20px 0;
}

.speed-btn {
  padding: 12px 15px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.speed-btn:hover {
  border-color: #666;
  background: #f5f5f5;
}

.speed-btn.active {
  background: #c41e3a;
  color: white;
  border-color: #c41e3a;
}

.distance-time-results {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 30px 0;
  padding: 0;
  background: transparent;
  border-radius: 0;
}

.result-item {
  flex: 1;
  max-width: 300px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 25px;
  background: #f5f5f5;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.result-item:hover {
  background: #efefef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  min-width: 50px;
  background: #0066cc;
  color: white;
  border-radius: 50%;
  font-size: 24px;
}

.result-content {
  flex: 1;
}

.result-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.result-value {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0;
  line-height: 1;
}

.car-diagram-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 30px 0;
  padding: 20px;
  background: #1a1f3f;
  border-radius: 12px;
  color: white;
}

.car-icon {
  font-size: 28px;
  color: #4fc3f7;
  flex-shrink: 0;
}

.distance-bar {
  height: 55px;
  background: transparent;
  border-radius: 30px;
  position: relative;
  overflow: visible;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.distance-indicator {
  height: 100%;
  background: linear-gradient(90deg, #66bb6a 0%, #a4cb38 30%, #ffc107 70%, #ff9800 100%);
  border-radius: 30px;
  transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  font-weight: 700;
  font-size: 18px;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(102, 187, 106, 0.4);
  white-space: nowrap;
  min-width: 120px;
}

.warning-icon {
  font-size: 24px;
  color: #ffa726;
  flex-shrink: 0;
}

.info-box {
  margin-top: 20px;
  padding: 15px;
  background: #fff8dc;
  border-left: 4px solid #f39c12;
  border-radius: 4px;
}

.info-box p {
  margin: 0;
  color: #333;
  font-weight: 500;
}
</style>
      `
    },
    {
      lessonNumber: 3,
      title: 'Décomposition de la distance d\'arrêt',
      content: `
<div class="lesson-page simple modern-redesign">
  <div class="lesson-content">
    <div class="page-header-badge">Page 3 / 6</div>
    
    <h1 class="question-title">Décomposition de la distance d'arrêt</h1>

    <!-- Blue Info Box -->
    <div class="info-box-blue">
      <p>La distance d'arrêt est celle que le conducteur sera contraint de parcourir après avoir vu un <strong>obstacle</strong>, avant l'arrêt de son véhicule. Elle se décompose en <strong>deux parties principales</strong>.</p>
    </div>

    <!-- Two Cards Section -->
    <div class="cards-container">
      <!-- Card 1: Distance de réaction (Orange) -->
      <div class="info-card orange-card">
        <div class="card-header">
          <div class="card-number orange-number">1</div>
          <h3 class="card-title">Distance de réaction</h3>
        </div>
        <p class="card-text">C'est le temps qui s'écoule entre le moment où l'on voit l'obstacle et le moment où l'on commence à freiner. À 50 km/h, cette distance équivaut à <strong>14 mètres</strong>.</p>
        <div class="card-divider"></div>
        <div class="card-info orange-info">ℹ Environ <strong>1 seconde</strong> pour un conducteur attentif</div>
      </div>

      <!-- Card 2: Distance de freinage (Pink) -->
      <div class="info-card pink-card">
        <div class="card-header">
          <div class="card-number pink-number">2</div>
          <h3 class="card-title">Distance de freinage</h3>
        </div>
        <p class="card-text">C'est la distance nécessaire au véhicule pour s'arrêter une fois que l'on a commencé à freiner. À 50 km/h, cette distance équivaut à <strong>12 mètres</strong>.</p>
        <div class="card-divider"></div>
        <div class="card-info pink-info">ℹ Dépend de la vitesse et de l'état de la route</div>
      </div>
    </div>

    <!-- Example Section -->
    <div class="example-section">
      <div class="example-title">🚗 Exemple à 50 km/h</div>
      
      <div class="distance-bar-container">
        <div class="distance-split-bar">
          <div class="distance-part orange-part" style="width: 54%;">
            <span class="distance-label">Temps de réaction : 14 m</span>
          </div>
          <div class="distance-part pink-part" style="width: 46%;">
            <span class="distance-label">Freinage : 12 m</span>
          </div>
        </div>
      </div>
      
      <div class="total-distance">
        <strong>Distance totale d'arrêt = 26 m</strong>
      </div>
    </div>
  </div>

  <!-- Navigation -->
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
      <button class="page-btn active">3</button>
      <button class="page-btn">4</button>
      <button class="page-btn">5</button>
      <button class="page-btn">6</button>
    </div>
  </div>
</div>

<style>
.lesson-page.modern-redesign {
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
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  width: fit-content;
}

.question-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 1rem 0 2rem 0;
}

/* Blue Info Box */
.info-box-blue {
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%);
  border-left: 5px solid #2196F3;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
}

.info-box-blue p {
  margin: 0;
  color: #1a1a2e;
  font-size: 1.05rem;
  line-height: 1.6;
}

.info-box-blue strong {
  color: #2196F3;
  font-weight: 700;
}

/* Cards Container */
.cards-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  gap: 1rem;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.orange-card {
  background: #FFF3CC;
  border: 3px solid #FF9800;
}

.pink-card {
  background: #FCE4EC;
  border: 3px solid #E91E63;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.card-number {
  width: 50px;
  height: 50px;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.orange-number {
  background: #1a2a4a;
}

.pink-number {
  background: #1a2a4a;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  padding-top: 0.25rem;
}

.card-text {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.6;
  margin: 0.5rem 0 0 0;
  flex-grow: 1;
}

.card-text strong {
  font-weight: 700;
  color: #1a1a2e;
}

.card-divider {
  height: 1px;
  border-top: 2px dashed #999;
  margin: 0.5rem 0;
}

.card-info {
  font-size: 0.9rem;
  padding-top: 0.5rem;
  font-weight: 500;
}

.orange-info {
  color: #FF6F00;
}

.orange-info strong {
  color: #1a1a2e;
  font-weight: 700;
}

.pink-info {
  color: #2196F3;
}

/* Example Section */
.example-section {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.example-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}

.distance-bar-container {
  margin-bottom: 1.5rem;
}

.distance-split-bar {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.distance-part {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.orange-part {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.pink-part {
  background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
}

.distance-label {
  text-align: center;
  white-space: nowrap;
}

.total-distance {
  text-align: center;
  font-size: 1.1rem;
  color: #1a1a2e;
  padding-top: 1rem;
}

.total-distance strong {
  font-size: 1.3rem;
}

/* Modern Navigation */
.lesson-footer.modern-nav {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 2rem;
  border-top: 2px solid #e0e0e0;
  margin-top: 3rem;
}

.nav-buttons-container {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.btn-nav-prev, .btn-nav-next {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex: 1;
  padding: 1rem;
  height: 60px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
  font-size: 1rem;
  text-transform: capitalize;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-nav-prev {
  background: #F5A623;
  color: white;
}

.btn-nav-prev:hover {
  background: #E8941F;
  transform: translateX(-2px);
  box-shadow: 0 6px 16px rgba(245, 166, 35, 0.3);
}

.btn-nav-next {
  background: #2196F3;
  color: white;
}

.btn-nav-next:hover {
  background: #1976D2;
  transform: translateX(2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.3);
}

.arrow {
  font-size: 1.2rem;
  font-weight: 700;
}

.pagination {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
}

.page-btn {
  width: 45px;
  height: 45px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  color: #999;
}

.page-btn:hover {
  border-color: #999;
  background: #f5f5f5;
}

.page-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .lesson-footer.modern-nav {
    gap: 1rem;
  }
  
  .nav-buttons-container {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .btn-nav-prev, .btn-nav-next {
    height: 50px;
  }
  
  .question-title {
    font-size: 1.6rem;
  }
  
  .distance-part {
    font-size: 0.85rem;
  }
  
  .page-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
      `
    },
    {
      lessonNumber: 4,
      title: 'Facteurs influençant la distance d\'arrêt',
      content: `
<div class="lesson-page simple">
  <div class="lesson-content">
    <span class="page-badge">Page 4 / 6</span>
    
    <h1 class="question-title">Facteurs influençant la distance d'arrêt</h1>

    <!-- Text Section -->
    <div class="diagram-intro-section">
      <div class="intro-paragraph">
        <p>La distance parcourue pendant le <strong>temps de réaction</strong> du conducteur dépend de la vitesse du véhicule et de l'<strong>état du conducteur</strong> (alcool, fatigue, ...).</p>
      </div>

      <div class="intro-paragraph">
        <p>La <strong>distance de freinage</strong> dépend de la vitesse. Mais attention, elle est fonction du <strong>carré de la vitesse</strong>. Ainsi, la distance de freinage d'un véhicule lancé à 100 km/h sera 4 fois plus grande que celle d'un véhicule roulant à 50 km/h : quand la vitesse double, la distance de freinage quadruple. D'autres paramètres influencent la distance de freinage : les conditions climatiques, l'état des pneumatiques, ...</p>
      </div>
    </div>

    <!-- Diagram Box -->
    <div class="diagram-container">
      <!-- 50 km/h Row -->
      <div class="distance-row">
        <div class="row-label">50 km/h</div>
        <div class="cars-and-markers">
          <div class="marker start-marker">∇ 0</div>
          <div class="cars-line">
            🚗 🚗 🚗 🚗 🚗 🚗
          </div>
          <div class="marker distance-14">≈ 14 m</div>
          <div class="marker distance-26">▼ ≈ 26 m</div>
        </div>
        <div class="row-note-right"><em>Exemple de véhicules roulant à 50 km/h et à 100 km/h</em></div>
      </div>

      <!-- Wedge Diagram for 50 km/h -->
      <svg class="wedge-diagram" viewBox="0 0 1000 120" preserveAspectRatio="xMidYMid meet">
        <!-- Green triangle (reaction time) -->
        <polygon points="0,60 280,20 280,100" fill="#4CAF50" opacity="0.85"/>
        <text x="140" y="50" text-anchor="middle" font-size="16" fill="white" font-weight="bold">temps de réaction : 1 s</text>
        <text x="140" y="85" text-anchor="middle" font-size="12" fill="white" font-weight="bold">f(v)</text>

        <!-- Orange triangle (braking distance) -->
        <polygon points="280,20 760,50 280,100" fill="#FF9800" opacity="0.85"/>
        <text x="520" y="60" text-anchor="middle" font-size="16" fill="white" font-weight="bold">distance de freinage</text>
        <text x="520" y="85" text-anchor="middle" font-size="12" fill="white" font-weight="bold">f(v²)</text>
      </svg>

      <!-- 100 km/h Row -->
      <div class="distance-row">
        <div class="row-label">100 km/h</div>
        <div class="cars-and-markers">
          <div class="marker start-marker">△ 0</div>
          <div class="cars-line cars-line-100">
            🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗
          </div>
          <div class="marker distance-28">≈ 28 m</div>
          <div class="marker distance-77">▲ ≈ 77 m</div>
        </div>
      </div>

      <!-- Wedge Diagram for 100 km/h -->
      <svg class="wedge-diagram wedge-100" viewBox="0 0 1000 120" preserveAspectRatio="xMidYMid meet">
        <!-- Green triangle (reaction time) -->
        <polygon points="0,60 365,10 365,110" fill="#4CAF50" opacity="0.85"/>
        <text x="183" y="50" text-anchor="middle" font-size="16" fill="white" font-weight="bold">temps de réaction</text>
        <text x="183" y="85" text-anchor="middle" font-size="12" fill="white" font-weight="bold">f(v)</text>

        <!-- Orange triangle (braking distance) -->
        <polygon points="365,10 1000,60 365,110" fill="#FF9800" opacity="0.85"/>
        <text x="683" y="60" text-anchor="middle" font-size="16" fill="white" font-weight="bold">distance de freinage</text>
        <text x="683" y="85" text-anchor="middle" font-size="12" fill="white" font-weight="bold">f(v²)</text>
      </svg>
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
      <button class="page-btn active">4</button>
      <button class="page-btn">5</button>
      <button class="page-btn">6</button>
    </div>
  </div>

  <style>
  .diagram-intro-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .intro-paragraph {
    font-size: 1rem;
    line-height: 1.7;
    color: #333;
  }

  .intro-paragraph p {
    margin: 0;
  }

  .intro-paragraph strong {
    color: #1a1a2e;
    font-weight: 700;
  }

  .diagram-container {
    background: #E8F4FD;
    border-radius: 12px;
    padding: 2rem;
    margin-top: 2rem;
  }

  .distance-row {
    position: relative;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .row-label {
    min-width: 80px;
    font-weight: 700;
    color: #1a1a2e;
    font-size: 1rem;
  }

  .cars-and-markers {
    flex: 1;
    position: relative;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cars-line {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 8px;
    font-size: 24px;
    width: 100%;
    justify-content: space-evenly;
  }

  .cars-line-100 {
    gap: 4px;
  }

  .marker {
    position: absolute;
    font-weight: 700;
    color: #1a1a2e;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .start-marker {
    left: 0;
    top: -20px;
  }

  .distance-14 {
    left: 28%;
    top: -20px;
  }

  .distance-26 {
    right: 0;
    top: 25px;
  }

  .distance-28 {
    left: 36.5%;
    top: -20px;
  }

  .distance-77 {
    right: 0;
    top: 25px;
  }

  .row-note-right {
    position: absolute;
    right: -250px;
    top: -20px;
    font-size: 0.85rem;
    color: #666;
    font-weight: 600;
    white-space: nowrap;
    max-width: 180px;
    line-height: 1.3;
  }

  .wedge-diagram {
    width: 100%;
    height: 120px;
    margin: 1rem 0 2rem 0;
  }

  .wedge-100 {
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .diagram-container {
      padding: 1rem;
    }

    .cars-line {
      gap: 4px;
      font-size: 18px;
    }

    .marker {
      font-size: 0.75rem;
    }

    .row-note-right {
      display: none;
    }

    .intro-paragraph {
      font-size: 0.95rem;
    }
  }
  </style>
</div>
      `
    },
    {
      lessonNumber: 5,
      title: 'Observation des distances par vitesse',
      content: `
<div class="lesson-page simple interactive-page">
  <div class="lesson-content">
    <div class="page-header-badge">Page 5 / 6</div>
    
    <h1 class="question-title">Observation des distances par vitesse</h1>

    <!-- Intro Text -->
    <div class="intro-text">
      <p>Sélectionnez une vitesse pour observer la distance parcourue pendant le temps de réaction et la distance de freinage.</p>
    </div>

    <!-- Speed Buttons -->
    <div class="speed-buttons-grid">
      <button class="speed-btn" data-speed="30">30 km/h</button>
      <button class="speed-btn" data-speed="40">40 km/h</button>
      <button class="speed-btn" data-speed="50">50 km/h</button>
      <button class="speed-btn" data-speed="60">60 km/h</button>
      <button class="speed-btn" data-speed="70">70 km/h</button>
      <button class="speed-btn" data-speed="80">80 km/h</button>
      <button class="speed-btn active" data-speed="90">90 km/h</button>
      <button class="speed-btn" data-speed="100">100 km/h</button>
      <button class="speed-btn" data-speed="110">110 km/h</button>
      <button class="speed-btn" data-speed="120">120 km/h</button>
      <button class="speed-btn" data-speed="130">130 km/h</button>
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
            <div class="distance-segment reaction-segment" id="reactionSegment">
              <span class="segment-label" id="reactionLabel">20.5 m</span>
            </div>
            <div class="distance-segment braking-segment" id="brakingSegment">
              <span class="segment-label" id="brakingLabel">24 m</span>
            </div>
          </div>
          <div class="end-section">
            <div class="stop-icon">🛑</div>
            <span class="end-text" id="totalDistance">44.5 m</span>
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
          <tr id="dataRow">
            <td><strong>90 km/h</strong></td>
            <td>0 → 26 m</td>
            <td>26 → 64.8 m</td>
            <td><strong>64.8 m</strong></td>
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

  <style>
  .interactive-page {
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
    background: #FF9800;
  }

  .legend-color.pink {
    background: #E91E63;
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

    .segment-label {
      font-size: 0.9rem;
    }

    .question-title {
      font-size: 1.5rem;
    }
  }
  </style>

  <script>
  document.addEventListener('DOMContentLoaded', function() {
    const speedData = {
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

    const speedButtons = document.querySelectorAll('.speed-btn');
    const reactionSegment = document.getElementById('reactionSegment');
    const brakingSegment = document.getElementById('brakingSegment');
    const reactionLabel = document.getElementById('reactionLabel');
    const brakingLabel = document.getElementById('brakingLabel');
    const totalDistance = document.getElementById('totalDistance');
    const dataRow = document.getElementById('dataRow');

    function updateVisualization(speed) {
      const data = speedData[speed];
      const totalDist = data.reaction + data.braking;
      const reactionPercent = (data.reaction / totalDist) * 100;
      const brakingPercent = (data.braking / totalDist) * 100;

      reactionSegment.style.flex = "0 1 " + reactionPercent + "%";
      brakingSegment.style.flex = "0 1 " + brakingPercent + "%";
      
      reactionLabel.textContent = data.reaction + ' m';
      brakingLabel.textContent = data.braking.toFixed(1) + ' m';

      totalDistance.textContent = data.total + ' m';

      dataRow.innerHTML = '<td><strong>' + speed + ' km/h</strong></td>' +
        '<td>0 → ' + data.reaction + ' m</td>' +
        '<td>' + data.reaction + ' → ' + data.total + ' m</td>' +
        '<td><strong>' + data.total + ' m</strong></td>';
    }

    speedButtons.forEach(button => {
      button.addEventListener('click', function() {
        speedButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        updateVisualization(parseInt(this.dataset.speed));
      });
    });

    // Initialize with 70 km/h
    updateVisualization(70);
  });
  </script>
</div>
      `
    },
    {
      lessonNumber: 6,
      title: 'Conclusion : Distances de sécurité',
      content: `
<div class="lesson-page simple">
  <div class="lesson-content">
    <span class="page-badge">Page 6 / 6</span>
    
    <h1 class="question-title">Conclusion : Distances de sécurité</h1>

    <div class="lesson-text">
      <h3><strong>RÉSUMÉ ESSENTIEL</strong></h3>
      
      <div class="key-point-box error">
        <h4>❌ UN VÉHICULE NE S'ARRÊTE PAS INSTANTANÉMENT</h4>
        <ul>
          <li>Entre l'observation de l'obstacle et l'arrêt complet : plusieurs dizaines de mètres</li>
          <li>À 130 km/h : jusqu'à 120 mètres !</li>
        </ul>
      </div>
      
      <div class="key-point-box success">
        <h4>✅ C'EST POURQUOI IL FAUT MAINTENIR UNE DISTANCE DE SÉCURITÉ</h4>
        <p><strong>Les règles à retenir :</strong></p>
        <ul>
          <li>📍 Sur autoroute : Au moins 2 bandes d'arrêt d'urgence (environ 90 mètres)</li>
          <li>📍 Sur route : Au moins 2 secondes de recul avec le véhicule qui précède</li>
        </ul>
      </div>
      
      <div class="calculation-box">
        <h4>CALCUL SIMPLE DE LA DISTANCE DE SÉCURITÉ :</h4>
        <p>Divisez le chiffre de votre vitesse par 2, puis multipliez par celui-ci.</p>
        <p><strong>Exemple à 50 km/h :</strong> (50 ÷ 2) × 2 = 50 mètres minimum</p>
      </div>
      
      <div class="benefits-box">
        <p><strong>Cette distance de sécurité vous permet de :</strong></p>
        <ul>
          <li>✓ Avoir le temps de réagir</li>
          <li>✓ Freiner sans collision</li>
          <li>✓ Augmenter la sécurité routière pour tous</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="lesson-footer">
    <div class="nav-buttons-container">
      <button class="btn-nav-prev">
        <span class="arrow">‹</span>
        <span class="text">Page précédente</span>
      </button>
      <button class="btn-nav-next" disabled>
        <span class="text">Page suivante</span>
        <span class="arrow">›</span>
      </button>
    </div>
    <div class="pagination">
      <button class="page-btn">1</button>
      <button class="page-btn">2</button>
      <button class="page-btn">3</button>
      <button class="page-btn">4</button>
      <button class="page-btn">5</button>
      <button class="page-btn active">6</button>
    </div>
  </div>
</div>
      `
    }
  ]
};
