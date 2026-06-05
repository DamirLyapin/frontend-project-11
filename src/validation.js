import * as yup from 'yup'

yup.setLocale({
  string: {
    url: () => ({ key: 'validation.errors.validURL' }),
  },
  mixed: {
    notOneOf: () => ({ key: 'validation.errors.notOneOf' }),
    required: () => ({ key: 'validation.errors.required' }),
  },
})

export const makeSchema = (urls) => {
  return yup.object().shape({
    rss: yup.string().trim().required().url().notOneOf(urls),
  })
}
