// app/mypage/edit/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // 버튼
import { Input } from "@/components/ui/input";   // 입력란
import { Label } from "@/components/ui/label";   // 입력란 제목
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";


export default function ProfileEditPage() {
  // 1. 입력된 닉네임 값을 관리할 상태(state)를 만듭니다.
  const [nickname, setNickname] = useState("");

  async function fetchUser() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/users/me`,
        { withCredentials: true }
        // 참고: 실제로는 토큰/인증이 필요할 수 있습니다.
      );
      console.log("사용자 정보 가져오기 성공:", response.data);
      // 서버에서 받은 닉네임으로 state를 설정합니다.
      setNickname(response.data.nickname); 
    } catch (err) {
      console.error("사용자 정보 가져오기 실패:", err);
      // 실패 시, mockUser 닉네임을 사용하거나 빈 값으로 둡니다.
      setNickname("익명 사용자 #4821"); // 예시 닉네임
    }
  }

// 2. 저장 버튼 클릭 시 실행될 함수
  const handleSave = async () => {
    // 닉네임이 비어있으면 저장하지 않음
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    console.log("새 닉네임:", nickname);

    try {
      // 1. 서버에 보낼 데이터 (API 명세서에 맞게)
      const requestData = {
        nickname: nickname,
      };

      // 2. API 명세서에 맞는 PATCH 요청 보내기
      const response = await axios.patch(
        `${API_BASE_URL}/api/users/me/nickname`, 
        requestData,
        { withCredentials: true }
      );

      // 3. 성공 시
      console.log("닉네임 수정 성공:", response.data);
      alert("닉네임이 성공적으로 변경되었습니다.");
      
      // 4. "나를 열었던" 부모 창(마이페이지)을 찾아서 새로고침
      if (window.opener) {
        window.opener.location.reload(true);
      }
      
      // 5. 현재 프로필 수정 탭 닫기
      window.close();

    } catch (err) {
      // 4. 실패 시
      console.error("닉네임 수정 실패:", err);
      alert("닉네임 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 3. 페이지가 처음 로드될 때 사용자 정보를 불러옵니다.
  useEffect(() => {
    console.log("프로필 수정 페이지 렌더링. 사용자 정보 요청");
    fetchUser();
  }, []); // [] 빈 배열은 "맨 처음에 딱 한 번만 실행"하라는 의미

  return (
    <main className="min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">프로필 수정</h1>
        <p className="text-muted-foreground mt-2 mb-8">
          새 닉네임을 입력하고 저장 버튼을 눌러주세요.
        </p>

        {/* --- 닉네임 수정 폼 --- */}
        <div className="space-y-4">
          {/* 닉네임 입력란 */}
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              placeholder="새 닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* TODO: 프로필 이미지 업로드, 자기소개 등 다른 필드 추가 가능 */}

          {/* 저장 버튼 */}
          <Button onClick={handleSave} className="w-full">
            저장하기
          </Button>
        </div>
        {/* --- 폼 끝 --- */}

      </div>
    </main>
  );
}