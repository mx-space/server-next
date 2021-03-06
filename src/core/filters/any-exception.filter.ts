/*
 * @Author: Innei
 * @Date: 2020-05-08 20:01:58
 * @LastEditTime: 2020-10-01 20:19:29
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/core/filters/any-exception.filter.ts
 * @Coding with Love
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'

import { getIp } from 'src/utils'
type myError = {
  readonly status: number
  readonly statusCode?: number

  readonly message?: string
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('捕获异常')
  catch(exception: unknown, host: ArgumentsHost) {
    // super.catch(exception, host)
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (exception as myError)?.status ||
          (exception as myError)?.statusCode ||
          HttpStatus.INTERNAL_SERVER_ERROR
    if (process.env.NODE_ENV === 'development') {
      console.error(exception)
    } else {
      const ip = getIp(request)
      this.logger.warn(
        'IP: ' +
          ip +
          `  错误信息: (${status}) ` +
          ((exception as any)?.response?.message ||
            (exception as myError)?.message ||
            '') +
          ` Path: ${decodeURI(request.raw.url)}`,
      )
    }

    response.status(status).send({
      ok: 0,
      statusCode: status,
      message:
        (exception as any)?.response?.message ||
        (exception as any)?.message ||
        '未知错误',
      timestamp: new Date().toISOString(),
      path: decodeURI(request.raw.url),
    })
  }
}
