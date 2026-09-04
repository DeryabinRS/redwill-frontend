import {
  App as AntdApp,
  Button,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Tooltip,
} from 'antd'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCreateUserMotorcycleMutation,
  useDeleteUserMotorcycleMutation,
  useGetMotorcycleMakesQuery,
  useGetMotorcycleModelsQuery,
  useGetUserMotorcyclesQuery,
} from '@features/motorcycle/motorcycleSlice'
import { DELETE_CONFIRM_DESCRIPTION } from '@utils/form'

const MAX_MOTORCYCLES = 3

type FormValues = {
  motorcycle_make_id: string
  motorcycle_model_id: string
  mileage?: number | null
}

function ProfileMotorcycles() {
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const [open, setOpen] = useState(false)
  const [makeId, setMakeId] = useState<string>()
  const [form] = Form.useForm<FormValues>()

  const { data: motorcycles = [], isLoading } = useGetUserMotorcyclesQuery()
  const { data: makes = [], isFetching: makesLoading } = useGetMotorcycleMakesQuery(undefined, {
    skip: !open,
  })
  const { data: models = [], isFetching: modelsLoading } = useGetMotorcycleModelsQuery(makeId || '', {
    skip: !open || !makeId,
  })
  const [createMotorcycle, { isLoading: isCreating }] = useCreateUserMotorcycleMutation()
  const [deleteMotorcycle, { isLoading: isDeleting }] = useDeleteUserMotorcycleMutation()
  const canAddMore = motorcycles.length < MAX_MOTORCYCLES

  useEffect(() => {
    if (!open) {
      setMakeId(undefined)
    }
  }, [open])

  const onOpenAdd = () => {
    if (!canAddMore) {
      message.warning(t('profile.motorcycleLimit', { count: MAX_MOTORCYCLES }))
      return
    }
    setOpen(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (!canAddMore) {
      message.warning(t('profile.motorcycleLimit', { count: MAX_MOTORCYCLES }))
      return
    }
    try {
      await createMotorcycle({
        motorcycle_make_id: values.motorcycle_make_id,
        motorcycle_model_id: values.motorcycle_model_id,
        mileage: values.mileage ?? null,
      }).unwrap()
      message.success(t('profile.motorcycleAdded'))
      setOpen(false)
    } catch {
      message.error(t('profile.motorcycleAddError'))
    }
  }

  const onDelete = async (id: number) => {
    try {
      await deleteMotorcycle(id).unwrap()
      message.success(t('profile.motorcycleDeleted'))
    } catch {
      message.error(t('profile.motorcycleDeleteError'))
    }
  }

  return (
    <section className="profile-shell__section">
      <div className="profile-shell__section-label">
        {t('profile.motorcycles')}
        <Button
          size="small"
          icon={<PlusOutlined />}
          aria-label={t('profile.motorcycleAdd')}
          title={canAddMore ? t('profile.motorcycleAdd') : t('profile.motorcycleLimit', { count: MAX_MOTORCYCLES })}
          onClick={onOpenAdd}
          disabled={!canAddMore}
          style={{ marginLeft: 4 }}
        />
      </div>

      {isLoading ? (
        <Spin size="small" />
      ) : motorcycles.length === 0 ? (
        <p className="profile-shell__empty">{t('profile.motorcycleEmpty')}</p>
      ) : (
        <div className="profile-motorcycles-list">
          {motorcycles.map((motorcycle) => (
            <div key={motorcycle.id} className="profile-motorcycle-item">
              <div className="profile-motorcycle-item__text">
                <div className="profile-motorcycle-item__title">
                  {motorcycle.make_name} {motorcycle.model_name}
                </div>
                {motorcycle.mileage != null ? (
                  <div className="profile-motorcycle-item__meta">
                    {t('profile.motorcycleMileage')}: {motorcycle.mileage.toLocaleString('ru-RU')} {t('profile.motorcycleMileageUnit')}
                  </div>
                ) : null}
              </div>
              <Tooltip title={t('common.delete')}>
                <span>
                  <Popconfirm
                    title={t('profile.motorcycleDeleteConfirmTitle')}
                    description={DELETE_CONFIRM_DESCRIPTION}
                    okText={t('common.delete')}
                    cancelText={t('common.cancel')}
                    okButtonProps={{ danger: true, loading: isDeleting }}
                    onConfirm={() => void onDelete(motorcycle.id)}
                  >
                    <button type="button" className="profile-motorcycle-item__remove" aria-label={t('common.delete')}>
                      <CloseOutlined />
                    </button>
                  </Popconfirm>
                </span>
              </Tooltip>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={t('profile.motorcycleAdd')}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form<FormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => void onSubmit(values)}
        >
          <Form.Item
            name="motorcycle_make_id"
            label={t('profile.motorcycleMake')}
            rules={[{ required: true, message: t('profile.motorcycleMakeRequired') }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              loading={makesLoading}
              placeholder={t('profile.motorcycleMakePlaceholder')}
              options={makes}
              onChange={(value: string) => {
                setMakeId(value)
                form.setFieldValue('motorcycle_model_id', undefined)
              }}
            />
          </Form.Item>
          <Form.Item
            name="motorcycle_model_id"
            label={t('profile.motorcycleModel')}
            rules={[{ required: true, message: t('profile.motorcycleModelRequired') }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              disabled={!makeId}
              loading={modelsLoading}
              placeholder={t('profile.motorcycleModelPlaceholder')}
              options={models}
            />
          </Form.Item>
          <Form.Item name="mileage" label={t('profile.motorcycleMileage')}>
            <InputNumber
              min={0}
              max={9999999}
              style={{ width: '100%' }}
              placeholder={t('profile.motorcycleMileagePlaceholder')}
            />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={isCreating}>
              {t('common.add')}
            </Button>
          </div>
        </Form>
      </Modal>
    </section>
  )
}

export default ProfileMotorcycles
