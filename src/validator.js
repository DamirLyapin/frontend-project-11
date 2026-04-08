import * as yup from 'yup'
import { proxy, subscribe, snapshot } from 'valtio/vanilla'

const schema = yup.object().shape({
    url: yup.string().required('Не должно быть пустым').url('Ссылка должна быть валидным URL')
})

const validate = (fields) => {
    try {
        schema.validateSync(fields)
        return {}
    } catch(e) {
        return (e)
    }
}

export default () => {
    const state = proxy({
        errors: [],
        urls: []
    })
    const form = document.querySelector('form')
    const updateUi = () => {
        
    }
}
