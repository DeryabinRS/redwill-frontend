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
      message.warning(`Можно добавить не более ${MAX_MOTORCYCLES} мотоциклов`)
      return
    }
    setOpen(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (!canAddMore) {
      message.warning(`Можно добавить не более ${MAX_MOTORCYCLES} мотоциклов`)
      return
    }
    try {
      await createMotorcycle({
        motorcycle_make_id: values.motorcycle_make_id,
        motorcycle_model_id: values.motorcycle_model_id,
        mileage: values.mileage ?? null,
      }).unwrap()
      message.success('Мотоцикл добавлен')
      setOpen(false)
    } catch {
      message.error('Не удалось добавить мотоцикл')
    }
  }

  const onDelete = async (id: number) => {
    try {
      await deleteMotorcycle(id).unwrap()
      message.success('Мотоцикл удалён')
    } catch {
      message.error('Не удалось удалить мотоцикл')
    }
  }

  return (
    <section className="profile-shell__section">
      <div className="profile-shell__section-label">
        {'Мои мотоциклы'}
        <Button
          size="small"
          icon={<PlusOutlined />}
          aria-label={'Добавить мотоцикл'}
          title={canAddMore ? 'Добавить мотоцикл' : `Можно добавить не более ${MAX_MOTORCYCLES} мотоциклов`}
          onClick={onOpenAdd}
          disabled={!canAddMore}
          style={{ marginLeft: 4 }}
        />
      </div>

      {isLoading ? (
        <Spin size="small" />
      ) : motorcycles.length === 0 ? (
        <p className="profile-shell__empty">{'Мотоциклы пока не добавлены'}</p>
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
                    {'Пробег'}: {motorcycle.mileage.toLocaleString('ru-RU')} {'км'}
                  </div>
                ) : null}
              </div>
              <Tooltip title={'Удалить'}>
                <span>
                  <Popconfirm
                    title={'Удалить мотоцикл?'}
                    description={DELETE_CONFIRM_DESCRIPTION}
                    okText={'Удалить'}
                    cancelText={'Отмена'}
                    okButtonProps={{ danger: true, loading: isDeleting }}
                    onConfirm={() => void onDelete(motorcycle.id)}
                  >
                    <button type="button" className="profile-motorcycle-item__remove" aria-label={'Удалить'}>
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
        title={'Добавить мотоцикл'}
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
            label={'Производитель'}
            rules={[{ required: true, message: 'Выберите производителя' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              loading={makesLoading}
              placeholder={'Выберите производителя'}
              options={makes}
              onChange={(value: string) => {
                setMakeId(value)
                form.setFieldValue('motorcycle_model_id', undefined)
              }}
            />
          </Form.Item>
          <Form.Item
            name="motorcycle_model_id"
            label={'Модель'}
            rules={[{ required: true, message: 'Выберите модель' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              disabled={!makeId}
              loading={modelsLoading}
              placeholder={'Выберите модель'}
              options={models}
            />
          </Form.Item>
          <Form.Item name="mileage" label={'Пробег'}>
            <InputNumber
              min={0}
              max={9999999}
              style={{ width: '100%' }}
              placeholder={'Укажите пробег'}
            />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setOpen(false)}>{'Отмена'}</Button>
            <Button type="primary" htmlType="submit" loading={isCreating}>
              {'Добавить'}
            </Button>
          </div>
        </Form>
      </Modal>
    </section>
  )
}

export default ProfileMotorcycles
