import { Button, Input, Space } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

type Props = {
  value?: string[]
  onChange?: (value: string[]) => void
}

function LinksInput({ value, onChange }: Props) {
  const links = value ?? []

  const update = (next: string[]) => onChange?.(next)

  const add = () => update([...links, ''])
  const remove = (index: number) => update(links.filter((_, i) => i !== index))
  const change = (index: number, val: string) => {
    const next = [...links]
    next[index] = val
    update(next)
  }

  return (
    <div>
      {links.map((link, index) => (
        <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
          <Input
            value={link}
            onChange={(e) => change(index, e.target.value)}
            placeholder="https://example.com"
          />
          <Button
            icon={<MinusCircleOutlined />}
            onClick={() => remove(index)}
            aria-label="Удалить ссылку"
          />
        </Space>
      ))}
      <Button type="dashed" icon={<PlusOutlined />} onClick={add} block>
        Добавить ссылку
      </Button>
    </div>
  )
}

export default LinksInput
