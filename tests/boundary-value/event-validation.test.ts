import { describe, it, expect } from 'vitest'
import { validateSubmission, Event } from '../utils/validation.utils'

describe('Etkinlik Gönderimi Doğrulama - Sınır Değer Testleri', () => {
  const mockEvent1on1: Event = { type: "1:1" }
  const mockEventGroup: Event = { type: "group", can_multiple_vote: true }
  const mockEventGroupSingleVote: Event = { type: "group", can_multiple_vote: false }

  describe('Zaman Dilimi Seçimi Doğrulama', () => {
    it('hiçbir zaman dilimi seçilmediğinde reddetmeli', () => {
      const result = validateSubmission(false, 'John Doe', 'john@example.com', {}, mockEventGroup)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe("Please select at least one time slot")
    })

    it('tam olarak bir zaman dilimi seçildiğinde kabul etmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })

    it('grup etkinlikleri için birden fazla zaman dilimi seçimini kabul etmeli', () => {
      const selectedSlots = { 'slot1': true, 'slot2': true, 'slot3': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })

    it('boş selectedSlots nesnesini işlemeli', () => {
      const result = validateSubmission(false, 'John Doe', 'john@example.com', {}, mockEventGroup)
      expect(result.isValid).toBe(false)
    })

    it('tüm değerleri false olan selectedSlots\'u işlemeli', () => {
      const selectedSlots = { 'slot1': false, 'slot2': false, 'slot3': false }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(false)
    })
  })

  describe('1:1 Etkinlik Doğrulama', () => {
    it('1:1 etkinlikler için tam olarak bir seçili zaman dilimini kabul etmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEvent1on1)
      expect(result.isValid).toBe(true)
    })

    it('1:1 etkinlikler için birden fazla seçili zaman dilimini reddetmeli', () => {
      const selectedSlots = { 'slot1': true, 'slot2': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEvent1on1)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe("Please select only one time slot for 1:1 events")
    })

    it('1:1 etkinlikler için çok sayıda seçili zaman dilimini reddetmeli', () => {
      const selectedSlots = { 'slot1': true, 'slot2': true, 'slot3': true, 'slot4': true, 'slot5': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEvent1on1)
      expect(result.isValid).toBe(false)
    })

    it('1:1 etkinlikler için karışık true/false değerlerini işlemeli', () => {
      const selectedSlots = { 'slot1': true, 'slot2': false, 'slot3': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEvent1on1)
      expect(result.isValid).toBe(false)
    })
  })

  describe('Tek Oy Hakkı Olan Grup Etkinliği Doğrulama', () => {
    it('tek oy hakkı olan grup etkinlikleri için tam olarak bir seçili zaman dilimini kabul etmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEventGroupSingleVote)
      expect(result.isValid).toBe(true)
    })

    it('tek oy hakkı olan grup etkinlikleri için birden fazla seçili zaman dilimini reddetmeli', () => {
      const selectedSlots = { 'slot1': true, 'slot2': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEventGroupSingleVote)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe("Multiple time slot selection is not allowed for this event")
    })
  })

  describe('Anonim Gönderim Doğrulama', () => {
    it('geçerli zaman dilimi seçimi ile anonim gönderimi kabul etmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(true, '', '', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })

    it('boş isim ve e-posta ile anonim gönderimi kabul etmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(true, '', '', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })

    it('geçersiz e-posta formatı ile anonim gönderimi kabul etmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(true, 'John', 'invalid-email', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })

    it('anonim gönderimler için de zaman dilimi seçimi zorunlu olmalı', () => {
      const result = validateSubmission(true, '', '', {}, mockEventGroup)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe("Please select at least one time slot")
    })
  })

  describe('Anonim Olmayan Gönderim Doğrulama', () => {
    it('isim boş olduğunda reddetmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, '', 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe("Please enter your name")
    })

    it('isim sadece boşluk karakterlerinden oluştuğunda reddetmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, '   ', 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe("Please enter your name")
    })

    it('e-posta boş olduğunda reddetmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, 'John Doe', '', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe("Please enter your email address")
    })

    it('e-posta sadece boşluk karakterlerinden oluştuğunda reddetmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, 'John Doe', '   ', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe("Please enter your email address")
    })

    it('e-posta formatı geçersiz olduğunda reddetmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, 'John Doe', 'invalid-email', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe("Please enter a valid email address")
    })

    it('geçerli isim ve e-posta ile uygun zaman dilimi seçimini kabul etmeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })
  })

  describe('Özel Durumlar ve Sınır Koşulları', () => {
    it('çok uzun isimleri işlemeli', () => {
      const longName = 'A'.repeat(1000)
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, longName, 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })

    it('tek karakterli isimleri işlemeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, 'A', 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })

    it('özel karakterler içeren isimleri işlemeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, 'John-O\'Connor Jr.', 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })

    it('çok sayıda zaman dilimini işlemeli', () => {
      const manySlots: Record<string, boolean> = {}
      for (let i = 0; i < 100; i++) {
        manySlots[`slot${i}`] = true
      }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', manySlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })

    it('can_multiple_vote özelliği olmayan etkinliği işlemeli', () => {
      const eventWithoutProperty: Event = { type: "group" }
      const selectedSlots = { 'slot1': true, 'slot2': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, eventWithoutProperty)
      expect(result.isValid).toBe(true)
    })

    it('null/undefined girdileri düzgün işlemeli', () => {
      const selectedSlots = { 'slot1': true }
      const result = validateSubmission(false, null as any, undefined as any, selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(false)
    })
  })

  describe('Zaman Dilimi Seçimi Sınır Testleri', () => {
    it('tam olarak sıfır seçili zaman dilimini işlemeli', () => {
      const selectedSlots = { 'slot1': false, 'slot2': false }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(false)
    })

    it('birçok arasından tam olarak bir seçili zaman dilimini işlemeli', () => {
      const selectedSlots = { 'slot1': false, 'slot2': true, 'slot3': false, 'slot4': false }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })

    it('tüm zaman dilimleri seçili olduğunda işlemeli', () => {
      const selectedSlots = { 'slot1': true, 'slot2': true, 'slot3': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEventGroup)
      expect(result.isValid).toBe(true)
    })

    it('1:1 etkinlik için tam olarak 2 zaman dilimi seçimini işlemeli', () => {
      const selectedSlots = { 'slot1': true, 'slot2': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEvent1on1)
      expect(result.isValid).toBe(false)
    })

    it('tek oy hakkı olan grup etkinliği için tam olarak 2 zaman dilimi seçimini işlemeli', () => {
      const selectedSlots = { 'slot1': true, 'slot2': true }
      const result = validateSubmission(false, 'John Doe', 'john@example.com', selectedSlots, mockEventGroupSingleVote)
      expect(result.isValid).toBe(false)
    })
  })
}) 