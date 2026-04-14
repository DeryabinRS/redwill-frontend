import { useState } from 'react'
import { Form, Input, Select, DatePicker, TimePicker, Button, Typography, Card, message, Space, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import LocationPicker from '../../components/LocationPicker'
import ImageCropper from '../../components/ImageCropper'
import { useGetPostCategoriesQuery, useCreatePostMutation } from '../../features/post/postSlice'
import { TinyEditor } from '../../components/TinyEditor'

const { Title } = Typography

type Orientation = 'portrait' | 'landscape'

interface FormValues {
	title: string
	content: string
	post_category_id: number
	location?: { latitude: number; longitude: number; address: string }
	image: string
	link?: string
	date_start: dayjs.Dayjs
	date_end?: dayjs.Dayjs
	time_start?: dayjs.Dayjs
	time_end?: dayjs.Dayjs
}

function AddPost() {
	const [form] = Form.useForm()
	const navigate = useNavigate()
	const [orientation, setOrientation] = useState<Orientation>('portrait')
	const [image, setImage] = useState('')
	
	const { data: categories, isLoading: isLoadingCategories } = useGetPostCategoriesQuery()
	const [ createPost, { isLoading: isSubmitting }] = useCreatePostMutation()

	const handleSubmit = async (values: FormValues) => {
		const content = ''
		try {
		const payload = {
			title: values.title,
			content: content,
			post_category_id: values.post_category_id,
			location: values.location?.address,
			latitude: values.location?.latitude,
			longitude: values.location?.longitude,
			image: image,
			link: values.link,
			date_start: values.date_start.format('YYYY-MM-DD'),
			date_end: values.date_end?.format('YYYY-MM-DD'),
			time_start: values.time_start?.format('HH:mm'),
			time_end: values.time_end?.format('HH:mm'),
		}
		console.log(payload)
		await createPost(payload).unwrap()
		message.success('Пост успешно создан')
		navigate('/dashboard/posts')
		} catch (error) {
		console.error('Create post error:', error)
		message.error('Ошибка при создании поста')
		}
	}

	return (
		<div className="container">
			<Title level={2}>Создание поста</Title>
			<Card>
				<Form
					form={form}
					layout="vertical"
					onFinish={handleSubmit}
					initialValues={{
						date_start: dayjs(),
					}}
				>
					<Row gutter={16}>
						<Col xs={{ flex: '100%' }} sm={{ flex: '30%' }}>
							<Form.Item
								name="image"
								label="Изображение (JPG, PNG)"
								rules={[{ required: true, message: 'Выберите изображение' }]}
							>
								<ImageCropper
									value={image}
									onChange={setImage}
									orientation={orientation}
									onOrientationChange={setOrientation}
								/>
							</Form.Item>
						</Col>
						<Col xs={{ flex: '100%' }} sm={{ flex: '70%' }}>
							<Form.Item
								name="title"
								label="Заголовок"
								rules={[
									{ required: true, message: 'Введите заголовок' },
									{ max: 255, message: 'Максимум 255 символов' },
								]}
							>
							<Input placeholder="Введите заголовок" />
							</Form.Item>

							<Form.Item
								name="post_category_id"
								label="Категория"
								rules={[{ required: true, message: 'Выберите категорию' }]}
							>
							<Select
									placeholder="Выберите категорию"
									loading={isLoadingCategories}
									options={categories?.map((cat) => ({
									value: cat.id,
									label: cat.name,
									}))}
							/>
							</Form.Item>

							<Form.Item
								name="content"
								label="Краткое описание"
								rules={[
									{ required: true, message: 'Введите содержание' },
									{ max: 1000, message: 'Максимум 1000 символов' },
								]}
							>
							<TinyEditor />
							</Form.Item>
							<Form.Item
								name="link"
								label="Ссылка"
								rules={[
									{ type: 'url', message: 'Введите корректный URL' },
								]}
							>
								<Input placeholder="https://example.com" />
							</Form.Item>
							<Form.Item
								name="location"
								label="Место проведения"
							>
								<LocationPicker />
							</Form.Item>

							<Space size="large" style={{ width: '100%' }}>
								<Form.Item
									name="date_start"
									label="Дата начала"
									rules={[{ required: true, message: 'Выберите дату начала' }]}
								>
									<DatePicker style={{ width: '100%' }} />
								</Form.Item>

								<Form.Item
									name="time_start"
									label="Время начала"
								>
									<TimePicker format="HH:mm" style={{ width: '100%' }} />
								</Form.Item>
							</Space>

							<Space size="large" style={{ width: '100%' }}>
								<Form.Item
									name="date_end"
									label="Дата окончания"
								>
									<DatePicker style={{ width: '100%' }} />
								</Form.Item>

								<Form.Item
									name="time_end"
									label="Время окончания"
								>
									<TimePicker format="HH:mm" style={{ width: '100%' }} />
								</Form.Item>
							</Space>

							<Form.Item>
								<Space>
									<Button type="primary" htmlType="submit" loading={isSubmitting}>
									Создать пост
									</Button>
									<Button onClick={() => navigate(-1)}>
									Отмена
									</Button>
								</Space>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Card>
		</div>
	)
}

export default AddPost
