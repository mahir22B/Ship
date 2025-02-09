import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// const LEMON_SQUEEZY_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJmZjA2ZjZhN2ZhN2U0NzUyNzc5ZjQ5MjA3Mjc4ZTI0YTUwMWJkNmFiMmEyNzI3YTQwYmFjNmFlZmM3ZjhmOGQ0OWViODRiNThlNmViNzlkMyIsImlhdCI6MTczOTA1NjM4NS4yMzgyMzQsIm5iZiI6MTczOTA1NjM4NS4yMzgyMzcsImV4cCI6MjA1NDU4OTE4NS4yMDYzNzgsInN1YiI6IjMwMzU4MzIiLCJzY29wZXMiOltdfQ.uqqvyQBmudcJNRMIiFNQxNmCDGsQkaLSZZo7VNRvxr7XMCWoSZa-popby6ch_f5Usn4Ik0m4NpXoiLg-C2SNjBhRj7Ud1X-jzp4IAcJVmCIRT8wWlTxYM4A5q-OT8pkcDZQ8aEV4FmZaZE-xfOz7I75cs3_MSv7azr6H8VphD0BsycpxwjtBegE3d5FHxuPruR0I-f29hP8O6Iq5NfJbwa_T1rax-tITAkM8uCm2z9XIij-Pm7NTfwpXGqj_ePcDrIo_R82hY9t-FoAaYOjv1hLgguMARIIlUozYzXz44lyeti5lIC7uOY9aV6EJ05_nYgnYTm1JB_WY0pTnZt-A-5uNtH5T5mlpplpCX7iS_7OqfEtsIy3G5OGe95Fj0kZPMhq4ne1_1ToiM3KkhtlDRXQgpzRrbJWJrTM9B6Y36X3q7j-5kpkJyA0L2eSQDLmFVrMWJSjbA03WvKy_8eR941ZbpmSwjl4tGliSU6q5rZKw81YM0U77BbhbdCZWO34j';
const LEMON_SQUEEZY_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJlNGI2NzE4NWIxOTdmNjBmODY5NWQ5ZTI3Zjk1Y2UyYzQzYTRjZWM2OWVkMDliYjI5OTU5ZmU5MTc4MDAwNzFmZDMzNmM1NmRjNTMwNmNiZCIsImlhdCI6MTczOTA1NzI5MS41MzAyNiwibmJmIjoxNzM5MDU3MjkxLjUzMDI2MywiZXhwIjoyMDU0NTkwMDkxLjQ5MTk2OCwic3ViIjoiMzAzNTgzMiIsInNjb3BlcyI6W119.B5c72xrzdvvveXCplmdra88yq_QGOog15K51dHihZlB7c4CyfIGE7odndak9P3ygaQlBT0sHJlrW2C8I53gtMS36mNHPkKq1U9u5xbZO4oY2U0bahWDZCDJmRuwyEUdWvQWtxOUvA1s5mEcuKH1MvXKNGjepwJIanIlsFzNltHBE6inqSfDFvoqzHKlwkMhNiYTJkP-uMRfA6sxVdxTR_iC-ahMi3rvNQSRqn25p8dpFInJh84Nkcu-rNcjdoI_QmCNZGeLnuGPKLbKTALGsVJFPcJOr9kI7-Gukv5eNAa9037_ghlSpQaaTuzHrwal2cnNbjeTYwDuBKzWJO1NDUd4wzVGTPAFys6lyIAudEZmSZyOXldOtVQqW1z1eCuEvLZwBI_GR7xTnFd_eiPe9Wr-dlI3GwenIEgqMTbv_Y8GATo-ICnPwtiF_moG8kfFgYyNLnJLTaPRvBTDaMmUgJ3AAn54oOB2TWUCKsVz0eZmzQFP83_xzJKdZxmTb4sLp";
const STORE_ID = "117195";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { variantId, userId, email } = body;

    console.log('Request received:', { variantId, userId, email });

    // Prepare the request payload with correct format
    const checkoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            custom: {
              user_id: userId
            },
            email: email
          },
          "product_options": {
          "redirect_url": "http://localhost:3000/"
      }
        },
        relationships: {
          store:{
            data:{
              type:'stores',
              id:STORE_ID
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId
            }
          }
        }
      }
    };

    console.log('Sending request to LemonSqueezy:', JSON.stringify(checkoutData, null, 2));

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEMON_SQUEEZY_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(checkoutData)
    });

    const responseData = await response.json();
    console.log('LemonSqueezy response status:', response.status);
    console.log('LemonSqueezy response:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('Error response:', responseData);
      return NextResponse.json(
        { error: responseData.errors?.[0]?.detail || 'Failed to create checkout' },
        { status: response.status }
      );
    }

    return NextResponse.json({ url: responseData.data.attributes.url });
  } catch (error: any) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error creating checkout' },
      { status: 500 }
    );
  }
}