import { StyleSheet, Platform, StatusBar } from 'react-native';

const ANDROID_TOP_PAD = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

export const COLORS = {
  bg: '#060D16',
  card: '#0B1A2E',
  cardAlt: '#0E2038',
  border: '#172B47',
  borderActive: '#22C55E',
  greenBg: '#0A261D',
  blue: '#3B82F6',
  sky: '#60A5FA',
  skyLight: '#93C5FD',
  text: '#F8FAFC',
  muted: '#94A3B8',
  dim: '#64748B',
  white: '#FFFFFF',
  red: '#EF4444'
};

export const styles = StyleSheet.create({
  // Loading / Hydration
  splashSafe: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  splashLogo: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 14
  },

  // Onboarding Midnight Navy Theme
  darkSafe: { flex: 1, backgroundColor: COLORS.bg, paddingTop: ANDROID_TOP_PAD },
  obHeader: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  obBackBtn: { padding: 4, marginRight: 10 },
  obBackText: { color: COLORS.white, fontSize: 22, fontWeight: '700' },
  obProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#111C2D',
    borderRadius: 99,
    overflow: 'hidden'
  },
  obProgressFill: { height: '100%', backgroundColor: '#7DD3FC', borderRadius: 99 },
  obScrollBody: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24 },
  obFooter: { paddingHorizontal: 22, paddingBottom: 24, paddingTop: 10, backgroundColor: COLORS.bg },
  obTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 26,
    lineHeight: 32
  },
  obOptionCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  obOptionCardSelected: {
    borderColor: COLORS.borderActive,
    backgroundColor: COLORS.greenBg
  },
  obOptionText: { fontSize: 16, fontWeight: '600', color: '#F1F5F9' },
  obOptionTextSelected: { color: '#FFFFFF' },
  obOptionSub: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  obRadioLeft: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  obRadioSelectedGreen: {
    borderColor: '#22C55E',
    backgroundColor: '#22C55E'
  },
  obCheckText: { color: '#060D16', fontSize: 13, fontWeight: '900' },
  obRightBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  obRightMuscleBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#13243C',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  obIconGlyph: { fontSize: 20, color: '#E2E8F0', fontWeight: '700' },
  obContinueBtn: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 99,
    alignItems: 'center'
  },
  obContinueText: { color: '#060D16', fontWeight: '700', fontSize: 17 },

  // Toggle pills (cm/ft, kg/lbs)
  unitSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 28
  },
  unitLabel: { fontSize: 15, fontWeight: '600', color: COLORS.dim },
  unitLabelActive: { color: COLORS.white },
  pillSwitchTrack: {
    width: 54,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E293B',
    padding: 3,
    justifyContent: 'center'
  },
  pillSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white
  },

  // Step 14 Frequency Slider
  freqBigText: { fontSize: 72, fontWeight: '800', color: '#3B82F6', textAlign: 'center' },
  freqSubText: { fontSize: 17, color: '#E2E8F0', textAlign: 'center', marginTop: 6, marginBottom: 42 },
  sliderWrap: { paddingHorizontal: 10, width: '100%' },
  sliderTrack: {
    height: 4,
    backgroundColor: '#1E3A5F',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sliderDotTouch: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  sliderDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1E3A5F' },
  sliderThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#93C5FD'
  },

  // Step 15 Workout days
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 10 },
  dayPill: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12
  },
  dayPillSelected: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.borderActive
  },
  dayPillText: { color: '#E2E8F0', fontSize: 15, fontWeight: '600' },

  // Cards inside Onboarding Summary (Steps 16-20)
  darkCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14
  },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: COLORS.muted, marginBottom: 10, marginTop: 6 },
  boldLight: { fontWeight: '700', color: '#F8FAFC', fontSize: 16 },
  mutedLight: { fontSize: 13, color: COLORS.muted },
  obHugeVal: { fontSize: 34, fontWeight: '800', color: COLORS.white, marginVertical: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Step 16 Curve & BMI Tick Bar
  curveWrap: {
    height: 120,
    justifyContent: 'flex-end',
    position: 'relative',
    marginVertical: 8
  },
  curveGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#172B47'
  },
  bmiTickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
    marginTop: 12,
    marginBottom: 8,
    position: 'relative'
  },
  bmiTick: { width: 3, height: 18, borderRadius: 2 },
  bmiNeedle: {
    position: 'absolute',
    width: 4,
    height: 28,
    borderRadius: 2,
    backgroundColor: COLORS.white,
    top: 0
  },

  // Step 17 Calendar Grid
  calGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18
  },
  calCell: { width: 36, alignItems: 'center', justifyContent: 'center' },
  calRestDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1E293B' },

  // Step 19 Analysis Bar Chart
  analysisBarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 20,
    height: 230,
    marginVertical: 20
  },
  analysisBarCol: { alignItems: 'center' },
  analysisBarRed: {
    width: 82,
    height: 190,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    paddingTop: 18,
    alignItems: 'center'
  },
  analysisBarGray: {
    width: 82,
    height: 112,
    borderRadius: 12,
    backgroundColor: '#27323F',
    paddingTop: 18,
    alignItems: 'center'
  },
  analysisBarPct: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  analysisBarCaption: { color: '#E2E8F0', fontSize: 16, fontWeight: '600', marginTop: 10 },

  // Branded Dashboard (Unified LevelUp Dark Navy Theme)
  safe: { flex: 1, backgroundColor: COLORS.bg, paddingTop: ANDROID_TOP_PAD },
  header: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.white, letterSpacing: 0.4 },
  subTitle: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  badge: {
    backgroundColor: '#132844',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    color: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden'
  },
  navWrap: { backgroundColor: COLORS.bg, borderBottomWidth: 1, borderColor: COLORS.border },
  nav: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  navBtnActive: { backgroundColor: COLORS.white, borderColor: COLORS.white },
  navText: { color: COLORS.muted, fontWeight: '600', fontSize: 13 },
  navTextActive: { color: '#060D16', fontWeight: '700' },
  body: { padding: 14, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: COLORS.white },
  cardSub: { fontSize: 13, color: COLORS.muted, marginBottom: 4 },
  bigNum: { fontSize: 21, fontWeight: '800', color: COLORS.white },
  muted: { fontSize: 12, color: COLORS.muted, lineHeight: 18 },
  bold: { fontWeight: '700', color: '#F1F5F9', fontSize: 13 },
  errorText: { fontSize: 12, color: '#F87171', marginTop: 6, fontWeight: '600' },
  barWrap: { height: 8, backgroundColor: '#13243C', borderRadius: 99, marginVertical: 10, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#38BDF8', borderRadius: 99 },
  btn: { backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 99 },
  btnText: { color: '#060D16', fontWeight: '700', fontSize: 13 },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#254166',
    backgroundColor: COLORS.cardAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 99
  },
  btnOutlineText: { color: '#E2E8F0', fontWeight: '600', fontSize: 13 },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderColor: '#13243C',
    gap: 10
  },
  unlockedRow: {
    backgroundColor: COLORS.greenBg,
    borderColor: '#14532D',
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4
  },
  pill: { fontSize: 11, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, overflow: 'hidden' },
  pillGreen: { backgroundColor: '#14532D', color: '#4ADE80' },
  pillGray: { backgroundColor: '#13243C', color: COLORS.muted },
  pillBlue: { backgroundColor: '#1E3A8A', color: '#93C5FD' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.cardAlt
  },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#60A5FA' },
  chipText: { fontSize: 12, color: '#CBD5E1', fontWeight: '500' },
  chipTextActive: { color: COLORS.white, fontWeight: '700' },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#060D16',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 3,
    borderRadius: 10,
    marginBottom: 12
  },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentBtnActive: { backgroundColor: '#172B47' },
  segmentText: { fontSize: 12, fontWeight: '600', color: COLORS.muted },
  segmentTextActive: { color: COLORS.white },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    backgroundColor: '#060D16',
    color: COLORS.white
  },
  chatBox: {
    backgroundColor: '#060D16',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    height: 290,
    marginBottom: 10
  },
  msg: { padding: 10, borderRadius: 12, maxWidth: '85%', marginBottom: 8 },
  msgUser: { alignSelf: 'flex-end', backgroundColor: '#2563EB' },
  msgBot: { alignSelf: 'flex-start', backgroundColor: COLORS.cardAlt, borderWidth: 1, borderColor: COLORS.border },
  tipBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#0E2444',
    borderColor: '#1E40AF'
  },

  // Gamified Attributes, Quests & Live Workout Player
  statRow: { marginBottom: 10 },
  statTrack: { height: 7, backgroundColor: '#13243C', borderRadius: 99, overflow: 'hidden', marginTop: 4 },
  statFill: { height: '100%', borderRadius: 99 },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#0E2038',
    borderWidth: 1,
    borderColor: '#172B47',
    marginBottom: 8
  },
  questRowDone: {
    backgroundColor: '#0A261D',
    borderColor: '#14532D'
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#060D16',
    borderWidth: 1,
    borderColor: '#172B47',
    borderRadius: 12,
    padding: 10,
    marginTop: 10
  },
  waterCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#172B47',
    alignItems: 'center',
    justifyContent: 'center'
  },
  liveBanner: {
    backgroundColor: '#0E2444',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  restBanner: {
    backgroundColor: '#0A261D',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  exerciseLiveCard: {
    backgroundColor: '#060D16',
    borderWidth: 1,
    borderColor: '#172B47',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },
  setPill: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    backgroundColor: '#0B1A2E'
  },
  setPillDone: {
    backgroundColor: '#14532D',
    borderColor: '#22C55E'
  },
  weightMiniInput: {
    width: 68,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: '#0B1A2E',
    textAlign: 'center'
  }
});
