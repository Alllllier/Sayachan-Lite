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
  NoteCreateDto,
  NoteDto,
  NoteTaskDraftsResponseDto,
  NoteUpdateDto,
  OwnerSystemStatusDto,
  ProjectCreateDto,
  ProjectDto,
  ProjectNextActionsResponseDto,
  ProjectStatus,
  ProjectUpdateDto,
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
  NoteCreateDto,
  NoteDto,
  NoteTaskDraftsResponseDto,
  NoteUpdateDto,
  OwnerSystemStatusDto,
  ProjectCreateDto,
  ProjectDto,
  ProjectNextActionsResponseDto,
  ProjectStatus,
  ProjectUpdateDto,
  PublicInviteDto,
  PublicUserDto,
  RegisterTesterDto
}

export type FetchListOptionsDto = {
  archived?: boolean
}
