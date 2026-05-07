import type {
  NoteDto,
  NoteTaskDraftsResponseDto,
  NoteWriteDto,
  ProjectDto,
  ProjectNextActionsResponseDto,
  ProjectStatus,
  ProjectWriteDto
} from '@sayachan/contracts'

export type ApiId = string
export type ApiDateString = string

export type AuthRole = 'owner' | 'tester'
export type {
  NoteDto,
  NoteTaskDraftsResponseDto,
  NoteWriteDto,
  ProjectDto,
  ProjectNextActionsResponseDto,
  ProjectStatus,
  ProjectWriteDto
}
export type ChatPersonalityBaseline = 'warm' | 'strict' | 'haraguro'
export type ChatConvergenceMode = 'explore' | 'guided' | 'decisive'

export type AuthCredentialsDto = {
  email: string
  password: string
}

export type RegisterTesterDto = AuthCredentialsDto & {
  inviteCode: string
}

export type PublicUserDto = {
  _id?: ApiId | null
  email?: string
  role?: AuthRole
  disabled?: boolean
  createdAt?: ApiDateString | null
  updatedAt?: ApiDateString | null
  lastLoginAt?: ApiDateString | null
}

export type AuthLoginResponseDto = {
  sessionToken?: string
  user?: PublicUserDto | null
  error?: string
}

export type PublicInviteDto = {
  _id?: ApiId | null
  codePreview?: string
  createdBy?: ApiId | null
  expiresAt?: ApiDateString | null
  revokedAt?: ApiDateString | null
  usedAt?: ApiDateString | null
  usedBy?: ApiId | null
  createdAt?: ApiDateString | null
}

export type CreatedInviteDto = PublicInviteDto & {
  code?: string
}

export type OwnerSystemStatusDto = {
  userCount: number
  testerCount: number
  activeInviteCount: number
  activeSessionCount: number
  roles: AuthRole[]
}

export type FetchListOptionsDto = {
  archived?: boolean
}

export type AiResourceRequestDto = {
  _id: ApiId
}

export type ChatMessageDto = {
  role: string
  content?: string
}

export type ChatContextDto = {
  activeProjectsCount: number
  activeTasksCount: number
  pinnedProjectName: string
  currentNextAction: string
} | null

export type ChatRuntimeControlsDto = {
  personalityBaseline?: ChatPersonalityBaseline
  futureSlots?: {
    warmth?: number
    reflectionDepth?: null
    convergenceMode?: ChatConvergenceMode
    thinking?: null
    debugContext?: null
  }
}

export type ChatRuntimePayloadDto = ChatRuntimeControlsDto & {
  lastUserMessage: string
}

export type ChatResponseDto = {
  reply: string
}
