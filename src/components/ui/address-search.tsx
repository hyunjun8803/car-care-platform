"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Search } from 'lucide-react';

// 카카오 Postcode 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          address: string;
          addressType: string;
          bname: string;
          buildingName: string;
          zonecode: string;
          roadAddress: string;
          jibunAddress: string;
          userSelectedType: string;
        }) => void;
        onclose?: (state: string) => void;
        width?: string | number;
        height?: string | number;
        animation?: boolean;
        focusInput?: boolean;
        focusContent?: boolean;
      }) => {
        open: () => void;
        embed: (element: HTMLElement | null) => void;
      };
    };
  }
}

interface AddressSearchProps {
  value: string;
  onChange: (address: string, detailAddress?: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function AddressSearch({ 
  value, 
  onChange, 
  placeholder = "주소를 검색해주세요",
  required = false,
  className = ""
}: AddressSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [detailAddress, setDetailAddress] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(value);

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    // 도로명 주소인 경우
    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ' (' + extraAddress + ')' : '');
    }

    setSelectedAddress(fullAddress);
    onChange(fullAddress, detailAddress);
    setIsOpen(false);
  };

  const openPostcode = () => {
    if (typeof window !== 'undefined' && window.daum) {
      new window.daum.Postcode({
        oncomplete: handleComplete,
        focusInput: false,
        focusContent: false,
        animation: true,
        width: '100%',
        height: '100%'
      }).open();
    } else {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleDetailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const detail = e.target.value;
    setDetailAddress(detail);
    onChange(selectedAddress, detail);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 기본 주소 검색 */}
      <div>
        <Label htmlFor="address">주소 {required && '*'}</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="address"
              type="text"
              value={selectedAddress}
              placeholder={placeholder}
              className="pl-10 cursor-pointer"
              readOnly
              onClick={openPostcode}
              required={required}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={openPostcode}
            className="px-4"
          >
            <Search className="h-4 w-4 mr-2" />
            검색
          </Button>
        </div>
      </div>

      {/* 상세 주소 입력 */}
      {selectedAddress && (
        <div>
          <Label htmlFor="detailAddress">상세주소</Label>
          <Input
            id="detailAddress"
            type="text"
            value={detailAddress}
            onChange={handleDetailAddressChange}
            placeholder="동, 호수 등 상세주소를 입력하세요"
            className="w-full"
          />
        </div>
      )}

      {/* 선택된 주소 미리보기 */}
      {selectedAddress && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">선택된 주소:</p>
              <p className="text-blue-700">
                {selectedAddress}
                {detailAddress && ` ${detailAddress}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}