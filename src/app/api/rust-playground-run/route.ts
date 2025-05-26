
// src/app/api/rust-playground-run/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RustRunRequest {
  channel: 'stable' | 'beta' | 'nightly';
  mode: 'debug' | 'release';
  edition: '2015' | '2018' | '2021' | '2024';
  crateType: 'bin' | 'lib';
  tests: boolean;
  code: string;
  backtrace: boolean;
}

interface RustRunResponse {
  success: boolean;
  stdout: string;
  stderr: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RustRunRequest;
    const { code } = body;

    // --- THIS IS MOCK LOGIC ---
    // Replace this with your actual backend call to compile/run Rust code.
    // For now, we'll simulate based on the code content.

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    if (code.includes('I AM NOT DONE')) {
      return NextResponse.json({
        success: false,
        stdout: '',
        stderr: 'Error: Exercise not yet completed. Found "I AM NOT DONE" comment.',
      });
    }

    if (code.includes('fn main() {') && code.includes('println!("Hello")')) {
       if (code.includes('panic!')) {
        return NextResponse.json({
            success: false,
            stdout: '',
            stderr: `thread 'main' panicked at 'explicit panic', src/main.rs:X:Y
note: run with \`RUST_BACKTRACE=1\` environment variable to display a backtrace`,
        });
      }
      return NextResponse.json({
        success: true,
        stdout: 'Hello\n',
        stderr: '',
      });
    }
    
    if (code.includes('let x = 5;')) {
        if (code.includes('x = 5;')) { // Missing let
             return NextResponse.json({
                success: false,
                stdout: '',
                stderr: `error: cannot find value \`x\` in this scope
  --> src/main.rs:3:5
   |
3  |     x = 5;
   |     ^ not found in this scope

error: aborting due to previous error
`,
            });
        }
         return NextResponse.json({
            success: true,
            stdout: 'x has the value 5\n',
            stderr: '',
        });
    }


    // Default mock response for other cases
    if (Math.random() > 0.3) { // Simulate occasional success
      return NextResponse.json({
        success: true,
        stdout: 'Mock execution successful.\nOutput from program...',
        stderr: '',
      });
    } else { // Simulate occasional failure
      return NextResponse.json({
        success: false,
        stdout: '',
        stderr: 'Mock compilation error: Something went wrong.\n  --> src/main.rs:2:5\n   |\n2  |     some_error_here();\n   |     ^^^^^^^^^^^^^^^ undefined function\n',
      });
    }
    // --- END OF MOCK LOGIC ---

  } catch (error) {
    console.error('API Error in /api/rust-playground-run:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
