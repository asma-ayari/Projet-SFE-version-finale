import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CoursService } from '../../core/services/cours';

interface SpeedData {
  speed: number;
  distance: number;
  time: number;
  reactionDistance: number;
  brakingDistance: number;
}

interface AdherenceSpeedData {
  speed: number;
  reactionDistance: number;
  brakingDistanceDry: number;
  brakingDistanceWet: number;
  brakingDistanceSoaked: number;
}

interface CoursePage {
  pageNumber: number;
  title: string;
  content: string;
  type: 'text' | 'interactive' | 'diagram' | 'summary';
  speedData?: SpeedData[];
}

interface Course {
  id: number;
  title: string;
  totalPages: number;
  pages: CoursePage[];
}

type RoadCondition = 'dry' | 'wet' | 'soaked';
type TireCondition = 'new' | 'worn';

@Component({
  selector: 'app-cours-detail',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './cours-detail.html',
  styleUrl: './cours-detail.css',
})
export class CoursDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursService = inject(CoursService);
  
  courseId = signal<number>(1);
  currentPage = signal<number>(1);
  selectedSpeed = signal<number>(50);
  
  // Adhérence course specific signals
  selectedRoadCondition = signal<RoadCondition>('dry');
  selectedTireCondition = signal<TireCondition>('new');
  cursorPosition = signal<number>(0);

  // Angles Morts course specific signals
  circlePositions = signal<{ green: number; yellow: number; violet: number; orange: number }>({
    green: -1, yellow: -1, violet: -1, orange: -1
  });
  hoveredVehicle = signal<string | null>(null);
  anglesValidated = signal<boolean>(false);

  // Téléphone Mobile course specific signals
  gamePhase = signal<'idle' | 'phase1' | 'phase2' | 'finished'>('idle');
  squarePosition = signal<{ x: number; y: number }>({ x: 150, y: 150 });
  circleObstacles = signal<{ x: number; y: number; id: number }[]>([]);
  gameScore = signal<{ avoided: number; stopped: number; collisions: number }>({ avoided: 0, stopped: 0, collisions: 0 });
  currentCalculation = signal<{ num1: number; num2: number; operator: string; answer: number } | null>(null);
  calculationResults = signal<{ correct: number; wrong: number }>({ correct: 0, wrong: 0 });
  isSquareStopped = signal<boolean>(false);
  selectedEffects = signal<{ [key: string]: string }>({});

  // Premiers Secours course specific signals
  securityObjectsPlaced = signal<{ [key: string]: boolean }>({
    triangle: false, gilet: false, extincteur: false, trousse: false, couverture: false, lampe: false
  });
  emergencyStepsCompleted = signal<{ protect: boolean; alert: boolean; help: boolean }>({
    protect: false, alert: false, help: false
  });
  carEquipmentPlaced = signal<string[]>([]);
  secoursArrived = signal<boolean>(false);

  // Alcool : les effets course specific signals (ID: 3)
  alcoholSex = signal<'M' | 'F'>('M');
  alcoholWeight = signal<number>(70);
  alcoholDrinks = signal<{ type: string; count: number }[]>([]);
  alcoholWithMeal = signal<boolean>(false);
  alcoholCursorPosition = signal<number>(0);
  drinksDragging = signal<string | null>(null);

  // Champ Visuel course specific signals (ID: 5)
  crossPlaced = signal<boolean>(false);
  experienceStep = signal<number>(1);
  carsSeen = signal<number | null>(null);
  visualFieldSpeed = signal<number>(50);
  experienceCompleted = signal<{ exp1: boolean; exp2: boolean }>({ exp1: false, exp2: false });
  showCarImage = signal<boolean>(false);
  memorizationPhase = signal<'waiting' | 'showing' | 'answering' | 'result'>('waiting');
  carsInImage = signal<number>(3);

  // Alcool : les doses course specific signals (ID: 6)
  selectedGlass = signal<string | null>(null);
  selectedBottle = signal<string | null>(null);
  scaleWeights = signal<number[]>([]);
  isBalanced = signal<boolean>(false);
  dosesSliderPosition = signal<number>(0);
  glassFilledWith = signal<string | null>(null);
  scaleExperimentStep = signal<number>(1);

  // Temps de réaction course specific signals (ID: 7)
  reactionTestPhase = signal<'idle' | 'waiting' | 'ready' | 'stimulus' | 'finished'>('idle');
  currentTestType = signal<'visual-simple' | 'auditory-simple' | 'visual-choice' | 'visual-object'>('visual-simple');
  reactionTimes = signal<number[]>([]);
  testTrialCount = signal<number>(0);
  stimulusVisible = signal<boolean>(false);
  stimulusColor = signal<'red' | 'green'>('red');
  stimulusStartTime = signal<number>(0);
  targetShape = signal<string>('circle');
  targetColor = signal<string>('red');
  objectsOnScreen = signal<{ shape: string; color: string; id: number }[]>([]);
  testResults = signal<{ visualSimple: number[]; auditorySimple: number[]; visualChoice: number[]; visualObject: number[] }>({
    visualSimple: [], auditorySimple: [], visualChoice: [], visualObject: []
  });
  reactionTimeSlider = signal<number>(1);
  reactionDistanceSpeed = signal<number>(50);
  userKeyPressed = signal<string | null>(null);
  lastTrialCorrect = signal<boolean | null>(null);

  // Cannabis : les effets course specific signals (ID: 9)
  cannabisTrajectoryPhase = signal<'idle' | 'playing' | 'finished'>('idle');
  rectanglePosition = signal<{ x: number; y: number }>({ x: 50, y: 200 });
  trajectoryPath = signal<{ x: number; y: number }[]>([]);
  trajectoryScore = signal<number>(0);
  trajectoryErrors = signal<number>(0);
  hoveredAccidentZone = signal<string | null>(null);
  cannabisEffectsDiscovered = signal<string[]>([]);
  trajectoryProgress = signal<number>(0);

  // Ceintures de sécurité course specific signals (ID: 10)
  seatbeltSelectedSpeed = signal<number>(10);
  seatbeltSelectedWeight = signal<number>(73);
  hoveredSafetyElement = signal<string | null>(null);
  
  // Métadonnées chargées du backend
  courseTitle = signal<string>('Distance d\'arrêt');
  courseTotalPages = signal<number>(6);
  
  // Map statique des pages par cours (liées à la logique interactive)
  // Les IDs vont de 1 à 11 (après correction du seed)
  private coursePageMap = { 1: 6, 2: 7, 3: 5, 4: 6, 5: 6, 6: 5, 7: 9, 8: 5, 9: 5, 10: 6, 11: 7 };
  
  // Speed data for page 2 (stopping distance)
  stoppingDistanceData: SpeedData[] = [
    { speed: 30, distance: 13, time: 2.1, reactionDistance: 8.5, brakingDistance: 4.5 },
    { speed: 40, distance: 19, time: 2.4, reactionDistance: 12, brakingDistance: 8 },
    { speed: 50, distance: 26.2, time: 2.8, reactionDistance: 15, brakingDistance: 12 },
    { speed: 60, distance: 34.4, time: 3.1, reactionDistance: 17.5, brakingDistance: 17.5 },
    { speed: 70, distance: 44.5, time: 3.5, reactionDistance: 20.5, brakingDistance: 24 },
    { speed: 80, distance: 53.7, time: 3.8, reactionDistance: 23, brakingDistance: 31.5 },
    { speed: 90, distance: 64.8, time: 4.2, reactionDistance: 26, brakingDistance: 39.5 },
    { speed: 100, distance: 76.9, time: 4.5, reactionDistance: 29, brakingDistance: 49 },
    { speed: 110, distance: 90, time: 4.9, reactionDistance: 31.5, brakingDistance: 59.7 },
    { speed: 120, distance: 104.1, time: 5.2, reactionDistance: 34.5, brakingDistance: 70.5 },
    { speed: 130, distance: 119.2, time: 5.6, reactionDistance: 37.5, brakingDistance: 82.5 }
  ];

  // Adhérence course data - braking distances for different conditions
  adherenceSpeedData: AdherenceSpeedData[] = [
    { speed: 30, reactionDistance: 9.5, brakingDistanceDry: 14, brakingDistanceWet: 14.2, brakingDistanceSoaked: 18 },
    { speed: 40, reactionDistance: 12.1, brakingDistanceDry: 20, brakingDistanceWet: 22.9, brakingDistanceSoaked: 28 },
    { speed: 50, reactionDistance: 15, brakingDistanceDry: 27.2, brakingDistanceWet: 31.2, brakingDistanceSoaked: 39.5 },
    { speed: 60, reactionDistance: 17.9, brakingDistanceDry: 35.5, brakingDistanceWet: 41.1, brakingDistanceSoaked: 53 },
    { speed: 70, reactionDistance: 20.5, brakingDistanceDry: 44.8, brakingDistanceWet: 52.9, brakingDistanceSoaked: 68.9 },
    { speed: 80, reactionDistance: 23.4, brakingDistanceDry: 55, brakingDistanceWet: 65.3, brakingDistanceSoaked: 86 },
    { speed: 90, reactionDistance: 26, brakingDistanceDry: 66, brakingDistanceWet: 79, brakingDistanceSoaked: 105.8 },
    { speed: 100, reactionDistance: 28.9, brakingDistanceDry: 78, brakingDistanceWet: 84.3, brakingDistanceSoaked: 127 },
    { speed: 110, reactionDistance: 31.5, brakingDistanceDry: 91, brakingDistanceWet: 111, brakingDistanceSoaked: 150.5 }
  ];

  course: Course = {
    id: 1,
    title: 'Distance d\'arrêt',
    totalPages: 6,
    pages: []
  };

  currentSpeedData = computed(() => {
    return this.stoppingDistanceData.find(d => d.speed === this.selectedSpeed()) || this.stoppingDistanceData[2];
  });

  // Speedometer needle angle: maps 0-130 km/h to -135° to +135° (270° sweep)
  speedometerAngle = computed(() => {
    const speed = this.selectedSpeed();
    return -135 + (speed / 130) * 270;
  });

  currentAdherenceSpeedData = computed(() => {
    return this.adherenceSpeedData.find(d => d.speed === this.selectedSpeed()) || this.adherenceSpeedData[4];
  });

  getCurrentBrakingDistance = computed(() => {
    const data = this.currentAdherenceSpeedData();
    switch (this.selectedRoadCondition()) {
      case 'wet': return data.brakingDistanceWet;
      case 'soaked': return data.brakingDistanceSoaked;
      default: return data.brakingDistanceDry;
    }
  });

  isFirstPage = computed(() => this.currentPage() === 1);
  isLastPage = computed(() => this.currentPage() === this.courseTotalPages());
  
  progressPercent = computed(() => {
    return Math.round((this.currentPage() / this.courseTotalPages()) * 100);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const courseId = parseInt(id, 10);
      this.courseId.set(courseId);

      const isFormateurRoute = this.router.url.startsWith('/formateur/');
      const courseRequest = isFormateurRoute
        ? this.coursService.manageGet(courseId)
        : this.coursService.getPublished(courseId);
      
      // Charger les métadonnées du cours du backend
      courseRequest.subscribe({
        next: (course) => {
          this.courseTitle.set(course.title);
          // Utiliser la map statique pour les pages (liées à la logique interactive)
          const pages = this.coursePageMap[courseId as keyof typeof this.coursePageMap] || 6;
          this.courseTotalPages.set(pages);
        },
        error: (err) => {
          console.error('Erreur lors du chargement du cours:', err);
          // Garder les valeurs par défaut en cas d'erreur
          const pages = this.coursePageMap[courseId as keyof typeof this.coursePageMap] || 6;
          this.courseTotalPages.set(pages);
        }
      });
    }
  }

  nextPage() {
    if (this.currentPage() < this.courseTotalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.courseTotalPages()) {
      this.currentPage.set(page);
    }
  }

  selectSpeed(speed: number) {
    this.selectedSpeed.set(speed);
  }

  selectRoadCondition(condition: RoadCondition) {
    this.selectedRoadCondition.set(condition);
  }

  selectTireCondition(condition: TireCondition) {
    this.selectedTireCondition.set(condition);
  }

  getSpeedOptions(): number[] {
    return [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];
  }

  getAdherenceSpeedOptions(): number[] {
    return [30, 40, 50, 60, 70, 80, 90, 100, 110];
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.courseTotalPages() }, (_, i) => i + 1);
  }

  getBarWidth(distance: number): number {
    const maxDistance = 130;
    return (distance / maxDistance) * 100;
  }

  getReactionBarWidth(): number {
    const data = this.currentSpeedData();
    const maxDistance = 130;
    return (data.reactionDistance / maxDistance) * 100;
  }

  getBrakingBarWidth(): number {
    const data = this.currentSpeedData();
    const maxDistance = 130;
    return (data.brakingDistance / maxDistance) * 100;
  }

  // Adhérence course specific methods
  getAdherenceBarWidth(distance: number): number {
    const maxDistance = 200;
    return (distance / maxDistance) * 100;
  }

  getAdherenceReactionBarWidth(): number {
    const data = this.currentAdherenceSpeedData();
    const maxDistance = 200;
    return (data.reactionDistance / maxDistance) * 100;
  }

  getAdherenceBrakingBarWidth(): number {
    const brakingDistance = this.getCurrentBrakingDistance();
    const maxDistance = 200;
    return (brakingDistance / maxDistance) * 100;
  }

  getTotalStoppingDistance(): number {
    const data = this.currentAdherenceSpeedData();
    return data.reactionDistance + this.getCurrentBrakingDistance();
  }

  getRoadConditionLabel(): string {
    switch (this.selectedRoadCondition()) {
      case 'wet': return 'طريق مبلل';
      case 'soaked': return 'طريق مغمور بالمياه';
      default: return 'طريق جاف';
    }
  }

  getRoadConditionIcon(): string {
    switch (this.selectedRoadCondition()) {
      case 'wet': return 'fa-cloud-rain';
      case 'soaked': return 'fa-water';
      default: return 'fa-sun';
    }
  }

  // Angles Morts course specific methods
  placeCircle(color: 'green' | 'yellow' | 'violet' | 'orange', position: number) {
    this.circlePositions.update(positions => ({
      ...positions,
      [color]: position
    }));
  }

  validateCirclePlacement() {
    const positions = this.circlePositions();
    // Green = windshield (position 0), Yellow = left mirror (1), Violet = interior mirror (2), Orange = right mirror (3)
    const isCorrect = positions.green === 0 && positions.yellow === 1 && positions.violet === 2 && positions.orange === 3;
    this.anglesValidated.set(isCorrect);
    return isCorrect;
  }

  resetCircles() {
    this.circlePositions.set({ green: -1, yellow: -1, violet: -1, orange: -1 });
    this.anglesValidated.set(false);
  }

  setHoveredVehicle(vehicle: string | null) {
    this.hoveredVehicle.set(vehicle);
  }

  isCirclePlaced(color: 'green' | 'yellow' | 'violet' | 'orange'): boolean {
    return this.circlePositions()[color] !== -1;
  }

  getCirclePosition(color: 'green' | 'yellow' | 'violet' | 'orange'): number {
    return this.circlePositions()[color];
  }

  // Téléphone Mobile course specific methods
  startGame(phase: 'phase1' | 'phase2') {
    this.gamePhase.set(phase);
    this.squarePosition.set({ x: 150, y: 150 });
    this.circleObstacles.set([]);
    this.isSquareStopped.set(false);
    if (phase === 'phase2') {
      this.generateCalculation();
    }
  }

  moveSquare(direction: 'up' | 'down' | 'left' | 'right') {
    if (this.isSquareStopped()) return;
    const pos = this.squarePosition();
    const step = 15;
    const maxX = 280;
    const maxY = 280;
    switch (direction) {
      case 'up': this.squarePosition.set({ x: pos.x, y: Math.max(0, pos.y - step) }); break;
      case 'down': this.squarePosition.set({ x: pos.x, y: Math.min(maxY, pos.y + step) }); break;
      case 'left': this.squarePosition.set({ x: Math.max(0, pos.x - step), y: pos.y }); break;
      case 'right': this.squarePosition.set({ x: Math.min(maxX, pos.x + step), y: pos.y }); break;
    }
  }

  stopSquare() {
    this.isSquareStopped.set(!this.isSquareStopped());
    if (this.isSquareStopped()) {
      this.gameScore.update(s => ({ ...s, stopped: s.stopped + 1 }));
    }
  }

  generateCalculation() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let answer: number;
    switch (operator) {
      case '+': answer = num1 + num2; break;
      case '-': answer = num1 - num2; break;
      case '×': answer = num1 * num2; break;
      default: answer = num1 + num2;
    }
    this.currentCalculation.set({ num1, num2, operator, answer });
  }

  submitAnswer(userAnswer: number) {
    const calc = this.currentCalculation();
    if (calc) {
      if (userAnswer === calc.answer) {
        this.calculationResults.update(r => ({ ...r, correct: r.correct + 1 }));
      } else {
        this.calculationResults.update(r => ({ ...r, wrong: r.wrong + 1 }));
      }
      this.generateCalculation();
    }
  }

  endGame() {
    this.gamePhase.set('finished');
  }

  resetGame() {
    this.gamePhase.set('idle');
    this.squarePosition.set({ x: 150, y: 150 });
    this.circleObstacles.set([]);
    this.gameScore.set({ avoided: 0, stopped: 0, collisions: 0 });
    this.calculationResults.set({ correct: 0, wrong: 0 });
    this.currentCalculation.set(null);
    this.isSquareStopped.set(false);
  }

  selectEffect(cause: string, effect: string) {
    this.selectedEffects.update(effects => ({
      ...effects,
      [cause]: effect
    }));
  }

  isEffectCorrect(cause: string): boolean {
    const correctAnswers: { [key: string]: string } = {
      'regard_fixe': 'detection_tardive',
      'temps_reaction': 'freinage_retard',
      'trajectoire': 'sortie_voie'
    };
    return this.selectedEffects()[cause] === correctAnswers[cause];
  }

  allEffectsSelected(): boolean {
    const effects = this.selectedEffects();
    return 'regard_fixe' in effects && 'temps_reaction' in effects && 'trajectoire' in effects;
  }

  // Premiers Secours course specific methods
  placeSecurityObject(objectId: string) {
    this.securityObjectsPlaced.update(objects => ({
      ...objects,
      [objectId]: true
    }));
  }

  completeEmergencyStep(step: 'protect' | 'alert' | 'help') {
    this.emergencyStepsCompleted.update(steps => ({
      ...steps,
      [step]: true
    }));
  }

  allEmergencyStepsCompleted(): boolean {
    const steps = this.emergencyStepsCompleted();
    return steps.protect && steps.alert && steps.help;
  }

  placeCarEquipment(item: string) {
    if (!this.carEquipmentPlaced().includes(item)) {
      this.carEquipmentPlaced.update(items => [...items, item]);
    }
  }

  isCarEquipmentPlaced(item: string): boolean {
    return this.carEquipmentPlaced().includes(item);
  }

  allCarEquipmentPlaced(): boolean {
    const required = ['triangle', 'gilet', 'extincteur', 'trousse', 'couverture', 'lampe'];
    return required.every(item => this.carEquipmentPlaced().includes(item));
  }

  callEmergency() {
    this.completeEmergencyStep('alert');
    setTimeout(() => {
      this.secoursArrived.set(true);
    }, 2000);
  }

  resetSecoursState() {
    this.securityObjectsPlaced.set({
      triangle: false, gilet: false, extincteur: false, trousse: false, couverture: false, lampe: false
    });
    this.emergencyStepsCompleted.set({ protect: false, alert: false, help: false });
    this.carEquipmentPlaced.set([]);
    this.secoursArrived.set(false);
  }

  // Alcool : les effets course specific methods (ID: 3)
  setAlcoholSex(sex: 'M' | 'F') {
    this.alcoholSex.set(sex);
    this.updateAlcoholCurve();
  }

  setAlcoholWeight(weight: number) {
    this.alcoholWeight.set(weight);
    this.updateAlcoholCurve();
  }

  addDrink(type: string) {
    const current = this.alcoholDrinks();
    const existing = current.find(d => d.type === type);
    if (existing) {
      this.alcoholDrinks.set(current.map(d => 
        d.type === type ? { ...d, count: d.count + 1 } : d
      ));
    } else {
      this.alcoholDrinks.set([...current, { type, count: 1 }]);
    }
    this.updateAlcoholCurve();
  }

  removeDrink(type: string) {
    const current = this.alcoholDrinks();
    const existing = current.find(d => d.type === type);
    if (existing && existing.count > 1) {
      this.alcoholDrinks.set(current.map(d => 
        d.type === type ? { ...d, count: d.count - 1 } : d
      ));
    } else {
      this.alcoholDrinks.set(current.filter(d => d.type !== type));
    }
    this.updateAlcoholCurve();
  }

  setAlcoholWithMeal(withMeal: boolean) {
    this.alcoholWithMeal.set(withMeal);
    this.updateAlcoholCurve();
  }

  setAlcoholCursorPosition(position: number) {
    this.alcoholCursorPosition.set(position);
  }

  getTotalDrinks(): number {
    return this.alcoholDrinks().reduce((sum, d) => sum + d.count, 0);
  }

  getDrinkCount(type: string): number {
    const drink = this.alcoholDrinks().find(d => d.type === type);
    return drink ? drink.count : 0;
  }

  calculateBloodAlcohol(): number {
    const drinks = this.alcoholDrinks();
    const weight = this.alcoholWeight();
    const sex = this.alcoholSex();
    const withMeal = this.alcoholWithMeal();
    
    // Each standard drink contains approximately 10g of pure alcohol
    let totalAlcohol = 0;
    drinks.forEach(d => {
      if (d.type === 'wine') totalAlcohol += d.count * 10; // 10cl wine ≈ 10g alcohol
      if (d.type === 'beer') totalAlcohol += d.count * 10; // 25cl beer 5° ≈ 10g alcohol  
      if (d.type === 'spirit') totalAlcohol += d.count * 10; // 3cl spirit ≈ 10g alcohol
    });
    
    // Widmark formula: BAC = (A / (r × W)) - (β × t)
    // r = 0.68 for men, 0.55 for women
    const r = sex === 'M' ? 0.68 : 0.55;
    
    // Calculate peak BAC (no time elapsed yet)
    let bac = totalAlcohol / (r * weight);
    
    // If with meal, absorption is slower and peak is lower
    if (withMeal) {
      bac *= 0.7;
    }
    
    return Math.round(bac * 100) / 100;
  }

  getEliminationTime(): number {
    const bac = this.calculateBloodAlcohol();
    // Elimination rate is approximately 0.15 g/L per hour
    return Math.ceil(bac / 0.15);
  }

  getRiskLevel(): string {
    const bac = this.calculateBloodAlcohol();
    if (bac < 0.2) return 'minimal';
    if (bac < 0.5) return 'moderate';
    if (bac < 0.8) return 'high';
    return 'very-high';
  }

  getAccidentMultiplier(): number {
    const position = this.alcoholCursorPosition();
    // Risk multiplier based on BAC level
    if (position <= 0) return 1;
    if (position <= 25) return 2;
    if (position <= 50) return 6;
    if (position <= 75) return 10;
    return 35;
  }

  resetAlcoholState() {
    this.alcoholSex.set('M');
    this.alcoholWeight.set(70);
    this.alcoholDrinks.set([]);
    this.alcoholWithMeal.set(false);
    this.alcoholCursorPosition.set(0);
  }

  private updateAlcoholCurve() {
    // This method would update any visual curve representation
    // The actual calculation is done in calculateBloodAlcohol()
  }

  // Champ Visuel course specific methods (ID: 5)
  placeCross() {
    this.crossPlaced.set(true);
    // Show car image after a delay in second attempt
    if (this.experienceStep() === 2) {
      setTimeout(() => {
        this.showCarImage.set(true);
      }, 500);
    }
  }

  nextExperienceStep() {
    const current = this.experienceStep();
    if (current < 3) {
      this.experienceStep.set(current + 1);
      this.crossPlaced.set(false);
      this.showCarImage.set(false);
    } else {
      this.experienceCompleted.update(exp => ({ ...exp, exp1: true }));
    }
  }

  startMemorization() {
    this.memorizationPhase.set('showing');
    // Generate random number of cars (2-5)
    const numCars = Math.floor(Math.random() * 4) + 2;
    this.carsInImage.set(numCars);
    // Show image briefly then hide
    setTimeout(() => {
      this.memorizationPhase.set('answering');
    }, 1500);
  }

  submitCarCount(count: number) {
    this.carsSeen.set(count);
    this.memorizationPhase.set('result');
    this.experienceCompleted.update(exp => ({ ...exp, exp2: true }));
  }

  setVisualFieldSpeed(speed: number) {
    this.visualFieldSpeed.set(speed);
  }

  getVisualFieldAngle(): number {
    const speed = this.visualFieldSpeed();
    // Visual field narrows with speed
    // At 0 km/h: 180°, at 130 km/h: approximately 30°
    if (speed <= 0) return 180;
    if (speed <= 40) return 150;
    if (speed <= 70) return 100;
    if (speed <= 100) return 75;
    if (speed <= 130) return 45;
    return 30;
  }

  getVisualFieldDescription(): string {
    const speed = this.visualFieldSpeed();
    if (speed <= 40) {
      return 'رؤية محيطية واسعة، وإدراك مثالي للمخاطر الجانبية';
    }
    if (speed <= 70) {
      return 'رؤية محيطية أقل، انتبه للمركبات على الجانبين';
    }
    if (speed <= 100) {
      return 'الرؤية تتركز إلى الأمام، مع خطر عدم ملاحظة الجانبين';
    }
    return 'رؤية نفقية، وإدراك جانبي محدود جداً';
  }

  getSpeedLimitForEnvironment(): { environment: string; limit: number; reason: string }[] {
    return [
      { environment: 'المدينة', limit: 50, reason: 'بيئة معقدة، مشاة، وتقاطعات' },
      { environment: 'الطريق', limit: 80, reason: 'تعقيد أقل لكن الحذر ضروري' },
      { environment: 'طريق سريع', limit: 110, reason: 'حركة انسيابية، وتقاطعات أقل' },
      { environment: 'الطريق السيارة', limit: 130, reason: 'مسارات منفصلة، ولا يوجد مشاة' }
    ];
  }

  resetVisualFieldState() {
    this.crossPlaced.set(false);
    this.experienceStep.set(1);
    this.carsSeen.set(null);
    this.visualFieldSpeed.set(50);
    this.experienceCompleted.set({ exp1: false, exp2: false });
    this.showCarImage.set(false);
    this.memorizationPhase.set('waiting');
  }

  // Alcool : les doses course specific methods (ID: 6)
  selectGlass(glass: string) {
    this.selectedGlass.set(glass);
    this.glassFilledWith.set(null);
    this.scaleWeights.set([]);
    this.isBalanced.set(false);
  }

  selectBottle(bottle: string) {
    this.selectedBottle.set(bottle);
    this.glassFilledWith.set(bottle);
    this.checkBalance();
  }

  addWeight(weight: number) {
    const current = this.scaleWeights();
    this.scaleWeights.set([...current, weight]);
    this.checkBalance();
  }

  removeWeight(index: number) {
    const current = this.scaleWeights();
    this.scaleWeights.set(current.filter((_, i) => i !== index));
    this.checkBalance();
  }

  private checkBalance() {
    const glass = this.selectedGlass();
    const bottle = this.glassFilledWith();
    if (!glass || !bottle) {
      this.isBalanced.set(false);
      return;
    }

    const alcoholContent = this.getAlcoholContentForGlass(glass, bottle);
    const totalWeight = this.scaleWeights().reduce((sum, w) => sum + w, 0);
    
    // Check if weights are within 1g of alcohol content
    this.isBalanced.set(Math.abs(totalWeight - alcoholContent) <= 1);
  }

  getAlcoholContentForGlass(glass: string, bottle: string): number {
    // Bar dose standard = 10g alcohol
    const alcoholContents: { [key: string]: { [key: string]: number } } = {
      'wine-glass': {
        'wine': 10,
        'champagne': 10
      },
      'beer-glass': {
        'beer': 10,
        'beer-strong': 15
      },
      'shot-glass': {
        'whisky': 10,
        'vodka': 10,
        'rum': 10
      },
      'cocktail-glass': {
        'cocktail': 15,
        'wine': 12,
        'whisky': 15
      }
    };
    
    return alcoholContents[glass]?.[bottle] || 10;
  }

  getTotalWeightOnScale(): number {
    return this.scaleWeights().reduce((sum, w) => sum + w, 0);
  }

  getBottleDisplayName(bottle: string): string {
    const labels: { [key: string]: string } = {
      wine: 'نبيذ',
      beer: 'جعة',
      whisky: 'ويسكي',
      champagne: 'شمبانيا',
      cocktail: 'كوكتيل',
      vodka: 'فودكا',
      rum: 'روم',
      'beer-strong': 'جعة قوية'
    };

    return labels[bottle] || bottle;
  }

  nextScaleStep() {
    const current = this.scaleExperimentStep();
    if (current < 3) {
      this.scaleExperimentStep.set(current + 1);
    }
  }

  setDosesSliderPosition(position: number) {
    this.dosesSliderPosition.set(position);
  }

  getDrinkEquivalences(): { name: string; description: string; volume: string; degree: string; doses: number }[] {
    return [
      { name: 'Bière légère', description: 'علبة جعة', volume: '33 سل', degree: '5.9°', doses: 2 },
      { name: 'Bière forte', description: 'علبة جعة قوية', volume: '50 سل', degree: '10°', doses: 4 },
      { name: 'Alcopop', description: 'علبة كوكتيل', volume: '25 سل', degree: '5°', doses: 1 },
      { name: 'Vin', description: 'زجاجة نبيذ', volume: '75 سل', degree: '12°', doses: 7 },
      { name: 'Whisky', description: 'كأس ممتلئ', volume: '9 سل', degree: '40°', doses: 3 }
    ];
  }

  getCurrentDrinkBySlider(): { name: string; description: string; volume: string; degree: string; doses: number } {
    const drinks = this.getDrinkEquivalences();
    const position = this.dosesSliderPosition();
    const index = Math.floor((position / 100) * (drinks.length - 0.01));
    return drinks[Math.min(index, drinks.length - 1)];
  }

  resetAlcoholDosesState() {
    this.selectedGlass.set(null);
    this.selectedBottle.set(null);
    this.scaleWeights.set([]);
    this.isBalanced.set(false);
    this.dosesSliderPosition.set(0);
    this.glassFilledWith.set(null);
    this.scaleExperimentStep.set(1);
  }

  // Temps de réaction course specific methods (ID: 7)
  initReactionTest(testType: 'visual-simple' | 'auditory-simple' | 'visual-choice' | 'visual-object') {
    this.currentTestType.set(testType);
    this.reactionTestPhase.set('idle');
    this.reactionTimes.set([]);
    this.testTrialCount.set(0);
    this.stimulusVisible.set(false);
    this.lastTrialCorrect.set(null);
    this.userKeyPressed.set(null);
  }

  startReactionTest() {
    this.reactionTestPhase.set('waiting');
    this.stimulusVisible.set(false);
    this.userKeyPressed.set(null);
    this.lastTrialCorrect.set(null);
    
    // Random delay between 1-4 seconds
    const delay = Math.random() * 3000 + 1000;
    
    setTimeout(() => {
      if (this.reactionTestPhase() === 'waiting') {
        this.showStimulus();
      }
    }, delay);
  }

  private showStimulus() {
    this.reactionTestPhase.set('stimulus');
    this.stimulusStartTime.set(Date.now());
    this.stimulusVisible.set(true);
    
    const testType = this.currentTestType();
    
    if (testType === 'visual-choice') {
      // Randomly select red or green
      this.stimulusColor.set(Math.random() > 0.5 ? 'red' : 'green');
    }
    
    if (testType === 'visual-object') {
      this.generateObjectsForTest();
    }
  }

  private generateObjectsForTest() {
    const shapes = ['circle', 'square', 'triangle', 'star'];
    const colors = ['red', 'green', 'blue', 'yellow'];
    
    // Set target shape and color
    this.targetShape.set(shapes[Math.floor(Math.random() * shapes.length)]);
    this.targetColor.set(colors[Math.floor(Math.random() * colors.length)]);
    
    // Generate 4-6 random objects including the target
    const numObjects = Math.floor(Math.random() * 3) + 4;
    const objects: { shape: string; color: string; id: number }[] = [];
    
    // Add target object
    objects.push({ shape: this.targetShape(), color: this.targetColor(), id: 0 });
    
    // Add distractor objects
    for (let i = 1; i < numObjects; i++) {
      let shape, color;
      do {
        shape = shapes[Math.floor(Math.random() * shapes.length)];
        color = colors[Math.floor(Math.random() * colors.length)];
      } while (shape === this.targetShape() && color === this.targetColor());
      objects.push({ shape, color, id: i });
    }
    
    // Shuffle objects
    this.objectsOnScreen.set(objects.sort(() => Math.random() - 0.5));
  }

  recordReaction(key?: string, objectId?: number) {
    if (this.reactionTestPhase() !== 'stimulus') return;
    
    const reactionTime = Date.now() - this.stimulusStartTime();
    const testType = this.currentTestType();
    let isCorrect = true;
    
    if (testType === 'visual-choice' && key) {
      this.userKeyPressed.set(key);
      const expectedKey = this.stimulusColor() === 'red' ? 'r' : 'v';
      isCorrect = key.toLowerCase() === expectedKey;
    }
    
    if (testType === 'visual-object' && objectId !== undefined) {
      const clickedObject = this.objectsOnScreen().find(o => o.id === objectId);
      isCorrect = clickedObject?.shape === this.targetShape() && 
                  clickedObject?.color === this.targetColor();
    }
    
    this.lastTrialCorrect.set(isCorrect);
    
    if (isCorrect) {
      this.reactionTimes.update(times => [...times, reactionTime]);
    }
    
    this.testTrialCount.update(c => c + 1);
    this.stimulusVisible.set(false);
    
    // Check if test is complete (5 trials)
    if (this.testTrialCount() >= 5) {
      this.finishTest();
    } else {
      this.reactionTestPhase.set('ready');
    }
  }

  private finishTest() {
    this.reactionTestPhase.set('finished');
    const testType = this.currentTestType();
    const times = this.reactionTimes();
    
    // Save results
    this.testResults.update(results => ({
      ...results,
      [testType === 'visual-simple' ? 'visualSimple' : 
       testType === 'auditory-simple' ? 'auditorySimple' : 
       testType === 'visual-choice' ? 'visualChoice' : 'visualObject']: times
    }));
  }

  getAverageReactionTime(testType?: string): number {
    let times: number[];
    
    if (testType) {
      const results = this.testResults();
      switch (testType) {
        case 'visual-simple': times = results.visualSimple; break;
        case 'auditory-simple': times = results.auditorySimple; break;
        case 'visual-choice': times = results.visualChoice; break;
        case 'visual-object': times = results.visualObject; break;
        default: times = [];
      }
    } else {
      times = this.reactionTimes();
    }
    
    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }

  getAllTestsAverage(): number {
    const results = this.testResults();
    const allTimes = [
      ...results.visualSimple,
      ...results.auditorySimple,
      ...results.visualChoice,
      ...results.visualObject
    ];
    if (allTimes.length === 0) return 0;
    return Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length);
  }

  setReactionTimeSlider(value: number) {
    this.reactionTimeSlider.set(value);
  }

  setReactionDistanceSpeed(speed: number) {
    this.reactionDistanceSpeed.set(speed);
  }

  getReactionDistance(): number {
    const speed = this.reactionDistanceSpeed();
    const reactionTime = this.reactionTimeSlider();
    // distance = speed (km/h) * time (s) / 3.6
    return Math.round((speed * reactionTime) / 3.6);
  }

  getBrainProcessingSteps(): { step: number; icon: string; title: string; description: string }[] {
    return [
      { step: 1, icon: 'fa-eye', title: 'الإدراك', description: 'تلتقط عيوننا وآذاننا المحفزات من البيئة المحيطة.' },
      { step: 2, icon: 'fa-brain', title: 'التحليل', description: 'يتم تحليل هذه الرسائل والتعرف عليها وتفسيرها.' },
      { step: 3, icon: 'fa-hand-pointer', title: 'القرار', description: 'نقرر الإجابة الواجب إعطاؤها وننقل الأوامر للتفاعل.' }
    ];
  }

  getFactorsAffectingReaction(): { factor: string; icon: string; effect: string }[] {
    return [
      { factor: 'Fatigue', icon: 'fa-bed', effect: 'Augmente le temps de réaction' },
      { factor: 'Alcool', icon: 'fa-wine-glass', effect: 'Ralentit les réflexes' },
      { factor: 'Téléphone', icon: 'fa-mobile-alt', effect: 'Distrait l\'attention' },
      { factor: 'Médicaments', icon: 'fa-pills', effect: 'Peut affecter la vigilance' },
      { factor: 'Âge', icon: 'fa-user-clock', effect: 'Les réflexes diminuent avec l\'âge' }
    ];
  }

  resetReactionTestState() {
    this.reactionTestPhase.set('idle');
    this.currentTestType.set('visual-simple');
    this.reactionTimes.set([]);
    this.testTrialCount.set(0);
    this.stimulusVisible.set(false);
    this.stimulusColor.set('red');
    this.stimulusStartTime.set(0);
    this.targetShape.set('circle');
    this.targetColor.set('red');
    this.objectsOnScreen.set([]);
    this.testResults.set({ visualSimple: [], auditorySimple: [], visualChoice: [], visualObject: [] });
    this.reactionTimeSlider.set(1);
    this.reactionDistanceSpeed.set(50);
    this.userKeyPressed.set(null);
    this.lastTrialCorrect.set(null);
  }

  // Cannabis : les effets course specific methods (ID: 9)
  startTrajectoryExercise() {
    this.cannabisTrajectoryPhase.set('playing');
    this.rectanglePosition.set({ x: 50, y: 200 });
    this.trajectoryErrors.set(0);
    this.trajectoryProgress.set(0);
    this.generateTrajectoryPath();
  }

  private generateTrajectoryPath() {
    // Generate a curvy trajectory path
    const path: { x: number; y: number }[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = 50 + (i * 4);
      const y = 200 + Math.sin(i * 0.1) * 80 + Math.cos(i * 0.05) * 40;
      path.push({ x, y });
    }
    this.trajectoryPath.set(path);
  }

  updateRectanglePosition(x: number, y: number) {
    if (this.cannabisTrajectoryPhase() !== 'playing') return;
    
    this.rectanglePosition.set({ x, y });
    
    // Check if rectangle is on the trajectory
    const path = this.trajectoryPath();
    const currentProgress = Math.min(100, Math.floor((x - 50) / 4));
    
    if (currentProgress > 0 && currentProgress <= path.length) {
      const targetY = path[currentProgress]?.y || 200;
      const deviation = Math.abs(y - targetY);
      
      if (deviation > 30) {
        this.trajectoryErrors.update(e => e + 1);
      }
      
      this.trajectoryProgress.set(currentProgress);
      
      if (currentProgress >= 95) {
        this.finishTrajectoryExercise();
      }
    }
  }

  finishTrajectoryExercise() {
    this.cannabisTrajectoryPhase.set('finished');
    const errors = this.trajectoryErrors();
    // Score based on errors (max 100, -5 per error)
    this.trajectoryScore.set(Math.max(0, 100 - errors * 5));
  }

  setHoveredAccidentZone(zone: string | null) {
    this.hoveredAccidentZone.set(zone);
  }

  discoverCannabisEffect(effect: string) {
    const current = this.cannabisEffectsDiscovered();
    if (!current.includes(effect)) {
      this.cannabisEffectsDiscovered.set([...current, effect]);
    }
  }

  getCannabisEffects(): { effect: string; icon: string; description: string }[] {
    return [
      { effect: 'perception', icon: 'fa-eye-slash', description: 'Altération de la perception visuelle et spatiale' },
      { effect: 'attention', icon: 'fa-brain', description: 'Diminution de l\'attention et de la concentration' },
      { effect: 'reaction', icon: 'fa-clock', description: 'Temps de réaction allongé' },
      { effect: 'coordination', icon: 'fa-hands', description: 'Troubles de la coordination motrice' },
      { effect: 'jugement', icon: 'fa-balance-scale', description: 'Altération du jugement et prise de risques' }
    ];
  }

  getAccidentSituations(): { id: string; title: string; description: string; icon: string }[] {
    return [
      { 
        id: 'sortie_route', 
        title: 'Sortie de route', 
        description: 'Difficulté à maintenir la trajectoire, notamment dans les virages. Le conducteur sous-estime la courbe ou réagit trop tard.',
        icon: 'fa-road'
      },
      { 
        id: 'collision', 
        title: 'Collision avec un obstacle', 
        description: 'Perception altérée des distances et de la vitesse. Le conducteur ne détecte pas à temps un obstacle fixe ou un véhicule.',
        icon: 'fa-car-crash'
      }
    ];
  }

  getRiskMultipliers(): { substance: string; multiplier: number; color: string }[] {
    return [
      { substance: 'Aucune', multiplier: 1, color: '#4caf50' },
      { substance: 'Cannabis seul', multiplier: 2, color: '#ff9800' },
      { substance: 'Alcool seul (0.5g/L)', multiplier: 3, color: '#f44336' },
      { substance: 'Cannabis + Alcool', multiplier: 14, color: '#b71c1c' }
    ];
  }

  resetCannabisState() {
    this.cannabisTrajectoryPhase.set('idle');
    this.rectanglePosition.set({ x: 50, y: 200 });
    this.trajectoryPath.set([]);
    this.trajectoryScore.set(0);
    this.trajectoryErrors.set(0);
    this.hoveredAccidentZone.set(null);
    this.cannabisEffectsDiscovered.set([]);
    this.trajectoryProgress.set(0);
  }

  // Ceintures de sécurité course specific methods (ID: 10)
  selectSeatbeltSpeed(speed: number) {
    this.seatbeltSelectedSpeed.set(speed);
  }

  selectSeatbeltWeight(weight: number) {
    this.seatbeltSelectedWeight.set(weight);
  }

  getSeatbeltSpeedOptions(): number[] {
    return [10, 20, 30, 40, 50];
  }

  getSeatbeltWeightOptions(): number[] {
    return [55, 65, 73, 85, 100];
  }

  calculateImpactForce(): number {
    // Force multiplier increases with speed (simplified physics model)
    // At 10 km/h ~10x arm strength, at 50 km/h ~50x
    return this.seatbeltSelectedSpeed();
  }

  getArmStrengthMessage(): string {
    const force = this.calculateImpactForce();
    const weight = this.seatbeltSelectedWeight();
    return `À ${this.seatbeltSelectedSpeed()} km/h, la force nécessaire pour retenir un poids de ${weight} kg correspond à ${force} fois la force des bras.`;
  }

  setHoveredSafetyElement(element: string | null) {
    this.hoveredSafetyElement.set(element);
  }

  getSafetyElementInfo(element: string): { title: string; description: string; icon: string } {
    const elements: { [key: string]: { title: string; description: string; icon: string } } = {
      'ceinture-avant': {
        title: 'Ceinture avant',
        description: 'Retient le corps lors d\'un choc et répartit les forces sur les parties solides du corps (bassin, thorax). Équipée d\'un prétensionneur qui la tend en cas de choc.',
        icon: 'fa-user-shield'
      },
      'ceinture-arriere': {
        title: 'Ceinture arrière',
        description: 'Tout aussi importante que la ceinture avant. Un passager arrière non attaché devient un projectile mortel pour les occupants avant en cas de choc.',
        icon: 'fa-users'
      },
      'airbag': {
        title: 'Airbag',
        description: 'Se déclenche en quelques millisecondes lors d\'un choc pour amortir l\'impact de la tête et du thorax. Fonctionne en complément de la ceinture, jamais seul.',
        icon: 'fa-life-ring'
      },
      'appuis-tete': {
        title: 'Appuis-tête',
        description: 'Protège les vertèbres cervicales du "coup du lapin" lors d\'un choc arrière. Doit être réglé à hauteur des yeux ou du sommet du crâne.',
        icon: 'fa-head-side-virus'
      },
      'sieges': {
        title: 'Sièges',
        description: 'Conçus pour absorber une partie de l\'énergie du choc et maintenir les occupants en position. Le siège conducteur doit permettre d\'atteindre les pédales bras légèrement fléchis.',
        icon: 'fa-chair'
      }
    };
    return elements[element] || { title: '', description: '', icon: '' };
  }

  getSafetyElements(): string[] {
    return ['ceinture-avant', 'ceinture-arriere', 'airbag', 'appuis-tete', 'sieges'];
  }
}
