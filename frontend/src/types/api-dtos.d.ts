import type {
  AiResourceRequestDto,
  AuthCredentialsDto,
  AuthLoginResponseDto,
  AuthRole,
  ChatContextDto,
  ChatConvergenceMode,
  ChatMessageDto,
  ChatPersonalityBaseline,
  ChatResponseDto,
  ChatRuntimeControlsDto,
  ChatRuntimePayloadDto,
  CreatedInviteDto,
  NoteDto,
  NoteTaskDraftsResponseDto,
  NoteWriteDto,
  OwnerSystemStatusDto,
  ProjectDto,
  ProjectNextActionsResponseDto,
  ProjectStatus,
  ProjectWriteDto,
  PublicInviteDto,
  PublicUserDto,
  RegisterTesterDto
} from '@sayachan/contracts'

export type ApiId = string
export type ApiDateString = string

export type {
  AiResourceRequestDto,
  AuthCredentialsDto,
  AuthLoginResponseDto,
  AuthRole,
  ChatContextDto,
  ChatConvergenceMode,
  ChatMessageDto,
  ChatPersonalityBaseline,
  ChatResponseDto,
  ChatRuntimeControlsDto,
  ChatRuntimePayloadDto,
  CreatedInviteDto,
  NoteDto,
  NoteTaskDraftsResponseDto,
  NoteWriteDto,
  OwnerSystemStatusDto,
  ProjectDto,
  ProjectNextActionsResponseDto,
  ProjectStatus,
  ProjectWriteDto,
  PublicInviteDto,
  PublicUserDto,
  RegisterTesterDto
}

export type FetchListOptionsDto = {
  archived?: boolean
}
