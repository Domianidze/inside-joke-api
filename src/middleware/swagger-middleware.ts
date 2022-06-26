import SwaggerUI from 'swagger-ui-express'
import YAML from 'yamljs'

export default () => {
  const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Inside Joke API Specs',
  }

  const swaggerDocument = YAML.load('./src/config/swagger.yaml')
  return SwaggerUI.setup(swaggerDocument, options)
}