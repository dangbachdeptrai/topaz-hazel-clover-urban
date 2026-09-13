export type ExamType = "VACT" | "THPTQG" | "TSA" | "PVP" | "TOWER" | "FORGED";
export type Difficulty = "easy" | "medium" | "hard";
export type AnswerKey = "A" | "B" | "C" | "D";
export type PvpStatus = "waiting" | "in_progress" | "completed";
export type PvpMode = "casual" | "ranked" | "shuffle";
export type RealmId = "luyen_khi" | "truc_co" | "kim_dan" | "nguyen_anh";
export type PerkId = "bang_tam" | "minh_nhan" | "kim_than" | "linh_van";
export type FrameId = "jade" | "gold" | "void" | "crimson";
export type GuildRole = "leader" | "elder" | "member";
export type BrStatus = "countdown" | "playing" | "completed";

export type Exam = {
  id: string;
  title: string;
  examType: ExamType;
  durationSeconds: number;
  totalQuestions: number;
  description: string;
  authorName: string;
  sourceLabel: string;
  isPublic: boolean;
};

export type QuestionPublic = {
  id: string;
  orderIndex: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  topic: string;
  difficulty: Difficulty;
  score: number;
  fadedOption: AnswerKey | null;

};

export type ExamAttempt = {
  id: string;
  examId: string;
  examTitle: string;
  examType: ExamType;
  score: number | null;
  submittedAt: string | null;
};

export type CultivationProfile = {
  userId: string;
  displayName: string;
  daoTitle: string;
  realmId: RealmId;
  realmName: string;
  realmHan: string;
  realmLayer: number;
  exp: number;
  expToNext: number;
  elo: number;
  linhThach: number;
  pvpWins: number;
  pvpLosses: number;
  pvpDraws: number;
  winStreak: number;
  bestStreak: number;
  towerBestFloor: number;
  guildId: string | null;
  guildName: string | null;
  guildTag: string | null;
  equippedFrame: FrameId | null;
  brWins: number;
  brBestPlace: number | null;
};

export type Perk = {
  id: PerkId;
  name: string;
  han: string;
  blurb: string;
  effect: "time" | "eliminate" | "exp" | "thach";
  value: number;
  minRealm: RealmId;
  cost: number;
  unlocked: boolean;
  equipped: boolean;
};

export type PvpMatch = {
  id: string;
  examId: string;
  examTitle: string;
  player1Id: string;
  player1Name: string;
  player2Id: string | null;
  player2Name: string | null;
  player1Score: number;
  player2Score: number;
  player1Answered: number;
  player2Answered: number;
  player1Done: boolean;
  player2Done: boolean;
  startTime: string | null;
  endTime: string | null;
  winnerId: string | null;
  status: PvpStatus;
  roomCode: string;
  durationSeconds: number;
  isBot: boolean;
  totalQuestions: number;
  mode: PvpMode;
  countdownEndsAt: string | null;
  countdownLeft: number;
  fightLeft: number;
  p1EloBefore: number | null;
  p2EloBefore: number | null;
  p1EloAfter: number | null;
  p2EloAfter: number | null;
  p1ExpGain: number;
  p2ExpGain: number;
};

export type ProfileStats = {
  examsTaken: number;
  avgScore: number;
  bestScore: number;
  pvpWins: number;
  pvpLosses: number;
  pvpDraws: number;
};

export type VaultDoc = {
  id: string;
  title: string;
  mime: string;
  sizeBytes: number;
  createdAt: string;
  ocrAt: string | null;
  ocrExamId: string | null;
  ocrCount: number;
};

export type OcrConfidence = "high" | "medium" | "low";

export type OcrDraftQuestion = {
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: AnswerKey;
  explanation: string;
  topic: string;
  difficulty: Difficulty;
  score: number;
  confidence: OcrConfidence;
};

export type OcrDraft = {
  title: string;
  questions: OcrDraftQuestion[];
};


export type TowerRun = {
  id: string;
  floor: number;
  status: "in_progress" | "cleared" | "failed";
  lives: number;
  questionIds: string[];
  index: number;
  correct: number;
  endsAt: string;
  remaining: number;
};

export type TutorMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ShopFrame = {
  id: FrameId;
  name: string;
  han: string;
  blurb: string;
  cost: number;
  owned: boolean;
  equipped: boolean;
};

export type GuildSummary = {
  id: string;
  name: string;
  tag: string;
  motto: string;
  inviteCode: string;
  leaderId: string;
  memberCount: number;
  totalElo: number;
  totalContribution: number;
};

export type GuildMember = {
  userId: string;
  displayName: string;
  daoTitle: string;
  role: GuildRole;
  contribution: number;
  realmName: string;
  realmHan: string;
  realmId: RealmId;
  elo: number;
  equippedFrame: FrameId | null;
};

export type GuildDetail = GuildSummary & {
  members: GuildMember[];
  myRole: GuildRole | null;
};

export type BrPlayer = {
  userId: string;
  displayName: string;
  isBot: boolean;
  isAlive: boolean;
  hasAnswered: boolean;
  correctCount: number;
  placement: number | null;
  eliminatedRound: number | null;
};

export type BrRoom = {
  id: string;
  examId: string;
  status: BrStatus;
  capacity: number;
  roundIndex: number;
  totalRounds: number;
  countdownLeft: number;
  roundLeft: number;
  winnerId: string | null;
  winnerName: string | null;
  players: BrPlayer[];
  myAlive: boolean;
  myPlacement: number | null;
  myAnswered: boolean;
  myExpGain: number;
  myThachGain: number;
};
