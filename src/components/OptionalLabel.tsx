type OptionalLabelProps = {
  text: string
}

function OptionalLabel({ text }: OptionalLabelProps) {
  return (
    <>
      {text}
      <span style={{ color: 'var(--ant-color-text-description)', marginLeft: 4 }}>
        (необязательно)
      </span>
    </>
  )
}

export default OptionalLabel
