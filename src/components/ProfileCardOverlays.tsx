import { Tooltip } from 'antd'
import {
  CheckCircleFilled,
  PlusCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  EyeInvisibleFilled,
} from '@ant-design/icons'
import { moderationStatusOptions } from '@utils/form'

type ProfileCardStatusBadgesProps = {
  publicationStatus?: number
  moderationStatus?: number
  publishedLabel?: string
  unpublishedLabel?: string
}

export function ProfileCardStatusBadges({
  publicationStatus,
  moderationStatus,
  publishedLabel = 'Опубликован',
  unpublishedLabel = 'Не опубликован',
}: ProfileCardStatusBadgesProps) {
  const isPublished = publicationStatus === 1
  const publicationLabel = isPublished ? publishedLabel : unpublishedLabel
  const moderation = moderationStatusOptions.find((item) => item.value === moderationStatus)

  const moderationIcon =
    moderationStatus === 1 ? (
      <CloseCircleFilled />
    ) : moderationStatus === 2 ? (
      <CheckCircleFilled />
    ) : (
      <ClockCircleFilled />
    )

  const moderationClass =
    moderationStatus === 1
      ? 'profile-card-status__icon--danger'
      : moderationStatus === 2
        ? 'profile-card-status__icon--success'
        : 'profile-card-status__icon--warning'

  return (
    <div className="profile-card-status" onClick={(event) => event.stopPropagation()}>
      <Tooltip title={publicationLabel}>
        <span
          className={`profile-card-status__icon ${isPublished ? 'profile-card-status__icon--success' : 'profile-card-status__icon--danger'}`}
          aria-label={publicationLabel}
        >
          {isPublished ? <PlusCircleFilled /> : <EyeInvisibleFilled />}
        </span>
      </Tooltip>
      {moderation ? (
        <Tooltip title={moderation.label}>
          <span className={`profile-card-status__icon ${moderationClass}`} aria-label={moderation.label}>
            {moderationIcon}
          </span>
        </Tooltip>
      ) : null}
    </div>
  )
}
