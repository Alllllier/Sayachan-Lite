type ApiId = string
type ApiDateString = string

type AuthRole = 'owner' | 'tester'
type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold'
type ChatPersonalityBaseline = 'warm' | 'strict' | 'haraguro'
type ChatConvergenceMode = 'explore' | 'guided' | 'decisive'

type AuthCredentialsDto = {
  email: string
  password: string
}

type RegisterTesterDto = AuthCredentialsDto & {
  inviteCode: string
}

type PublicUserDto = {
  _id?: ApiId | null
  email?: string
  role?: AuthRole
  disabled?: boolean
  createdAt?: ApiDateString | null
  updatedAt?: ApiDateString | null
  lastLoginAt?: ApiDateString | null
}

type AuthLoginResponseDto = {
  sessionToken?: string
  user?: PublicUserDto | null
  error?: string
}

type PublicInviteDto = {
  _id?: ApiId | null
  codePreview?: string
  createdBy?: ApiId | null
  expiresAt?: ApiDateString | null
  revokedAt?: ApiDateString | null
  usedAt?: ApiDateString | null
  usedBy?: ApiId | null
  createdAt?: ApiDateString | null
}

type CreatedInviteDto = PublicInviteDto & {
  code?: string
}

type OwnerSystemStatusDto = {
  userCount: number
  testerCount: number
  activeInviteCount: number
  activeSessionCount: number
  roles: AuthRole[]
}

type FetchListOptionsDto = {
  archived?: boolean
}

type NoteWriteDto = {
  title: string
  content: string
}

type NoteDto = NoteWriteDto & {
  _id?: ApiId
  archived?: boolean
  isPinned?: boolean
  updatedAt?: ApiDateString
}

type ProjectWriteDto = {
  name: string
  summary: string
  status: ProjectStatus
  currentFocusTaskId?: ApiId | null
}

type ProjectDto = ProjectWriteDto & {
  _id?: ApiId
  archived?: boolean
  isPinned?: boolean
  updatedAt?: ApiDateString
}

type AiResourceRequestDto = {
  _id: ApiId
}

type NoteTaskDraftsResponseDto = {
  drafts: string[]
}

type ProjectNextActionsResponseDto = {
  suggestions: string[]
}

type ChatMessageDto = {
  role: string
  content?: string
}

type ChatContextDto = Record<string, unknown> | null

type ChatRuntimeControlsDto = {
  personalityBaseline?: ChatPersonalityBaseline
  futureSlots?: {
    warmth?: number
    reflectionDepth?: null
    convergenceMode?: ChatConvergenceMode
    thinking?: null
    debugContext?: null
  }
}

type ChatRuntimePayloadDto = ChatRuntimeControlsDto & {
  lastUserMessage: string
}

type ChatResponseDto = {
  reply: string
}
