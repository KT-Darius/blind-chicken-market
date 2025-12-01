import { NextRequest, NextResponse } from "next/server";

/**
 * 토스페이먼츠 결제 승인 API
 * POST /api/payments/confirm
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    // 필수 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { message: "필수 파라미터가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 토스페이먼츠 시크릿 키 (환경변수에서 가져오기)
    // 테스트 환경에서는 test_gsk_로 시작하는 시크릿 키 사용
    const secretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

    // Base64 인코딩 (시크릿 키 + 콜론)
    const encodedKey = Buffer.from(`${secretKey}:`).toString("base64");

    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${encodedKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("토스페이먼츠 결제 승인 실패:", data);
      return NextResponse.json(
        {
          message: data.message || "결제 승인에 실패했습니다.",
          code: data.code,
        },
        { status: response.status },
      );
    }

    // 결제 승인 성공
    console.log("결제 승인 성공:", data);

    // TODO: 여기서 추가로 데이터베이스에 결제 정보를 저장하거나
    // 주문 상태를 업데이트하는 로직을 추가할 수 있습니다.

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("결제 승인 API 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
