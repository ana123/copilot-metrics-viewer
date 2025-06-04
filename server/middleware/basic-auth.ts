import { createError, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const enabled =
    config.basicAuth?.enabled === true || config.basicAuth?.enabled === 'true'
  if (!enabled) {
    return
  }

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    event.node.res.setHeader('WWW-Authenticate', 'Basic realm="Protected"')
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString()
  const [username, password] = credentials.split(':')
  if (
    username !== config.basicAuth.username ||
    password !== config.basicAuth.password
  ) {
    event.node.res.setHeader('WWW-Authenticate', 'Basic realm="Protected"')
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
