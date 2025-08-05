import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID de pago requerido' },
        { status: 400 }
      );
    }

    // Consultar el estado del pago en Mercado Pago
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al consultar pago: ${response.status}`);
    }

    const paymentData = await response.json();

    return NextResponse.json({
      id: paymentData.id,
      status: paymentData.status,
      status_detail: paymentData.status_detail,
      date_approved: paymentData.date_approved,
      date_created: paymentData.date_created,
      amount: paymentData.transaction_amount,
      currency: paymentData.currency_id,
      payment_method: paymentData.payment_method?.type,
      payment_type: paymentData.payment_type_id,
    });

  } catch (error) {
    console.error('Error al consultar pago:', error);
    return NextResponse.json(
      { error: 'Error al consultar el estado del pago' },
      { status: 500 }
    );
  }
} 