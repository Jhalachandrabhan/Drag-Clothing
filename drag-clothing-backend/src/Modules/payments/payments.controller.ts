import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payment.service';

@Controller('payments')
export class PaymentsController {

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  createOrder(@Body('orderId') orderId: string) {
    return this.paymentsService.createGatewayOrder(orderId);
  }

  @Post('verify')
  verifyPayment(
    @Body('orderId') orderId: string,
    @Body('paymentId') paymentId: string,
    @Body('signature') signature: string,
    @Body('appOrderId') appOrderId?: string,
  ) {
    return this.paymentsService.verifyGatewayPayment(
      orderId,
      paymentId,
      signature,
      appOrderId,
    );
  }

  @Post('webhook')
  webhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any,
  ) {
    const rawBody = req.rawBody?.toString('utf8') ?? JSON.stringify(body);
    return this.paymentsService.handleWebhook(rawBody, signature);
  }

}
