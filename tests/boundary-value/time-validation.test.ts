import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  checkTimeConflicts, 
  hasPastDates, 
  isPastTime, 
  validateTimeSlotGaps,
  DateTimeSlot 
} from '../utils/validation.utils'

describe('Zaman ve Tarih Doğrulama - Sınır Değer Testleri', () => {
  beforeEach(() => {
    // Tutarlı test için mevcut tarihi 1 Ocak 2024, 12:00 olarak ayarla
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  describe('Zaman Çakışması Tespiti', () => {
    it('çakışmayan zaman dilimleri için çakışma tespit etmemeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '11:00', endTime: '12:00' },
          { startTime: '13:00', endTime: '14:00' }
        ]
      }]
      expect(checkTimeConflicts(slots)).toBe(false)
    })

    it('çakışan zaman dilimleri için çakışma tespit etmeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '09:00', endTime: '11:00' },
          { startTime: '10:30', endTime: '12:00' }
        ]
      }]
      expect(checkTimeConflicts(slots)).toBe(true)
    })

    it('tam sınırda çakışma durumunu tespit etmeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '10:00', endTime: '11:00' }
        ]
      }]
      expect(checkTimeConflicts(slots)).toBe(false) // Tam sınır çakışma sayılmamalı
    })

    it('bir dakikalık çakışmayı tespit etmeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '09:00', endTime: '10:01' },
          { startTime: '10:00', endTime: '11:00' }
        ]
      }]
      expect(checkTimeConflicts(slots)).toBe(true)
    })

    it('tek zaman diliminde çakışma olmamalı', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-01'),
        timeSlots: [{ startTime: '09:00', endTime: '10:00' }]
      }]
      expect(checkTimeConflicts(slots)).toBe(false)
    })

    it('boş zaman dilimleri dizisini işlemeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-01'),
        timeSlots: []
      }]
      expect(checkTimeConflicts(slots)).toBe(false)
    })

    it('birden fazla tarihte çakışmaları tespit etmeli', () => {
      const slots: DateTimeSlot[] = [
        {
          date: new Date('2024-01-01'),
          timeSlots: [
            { startTime: '09:00', endTime: '10:00' },
            { startTime: '11:00', endTime: '12:00' }
          ]
        },
        {
          date: new Date('2024-01-02'),
          timeSlots: [
            { startTime: '09:00', endTime: '11:00' },
            { startTime: '10:30', endTime: '12:00' } // İkinci tarihte çakışma
          ]
        }
      ]
      expect(checkTimeConflicts(slots)).toBe(true)
    })

    it('sıralanmamış zaman dilimlerini işlemeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '13:00', endTime: '14:00' },
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '11:00', endTime: '12:00' }
        ]
      }]
      expect(checkTimeConflicts(slots)).toBe(false)
    })

    it('sıralanmamış çakışan dilimlerde çakışmayı tespit etmeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '13:00', endTime: '15:00' },
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '14:00', endTime: '16:00' } // İlk dilimle çakışıyor
        ]
      }]
      expect(checkTimeConflicts(slots)).toBe(true)
    })

    it('24 saat formatında sınır durumunu işlemeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '23:00', endTime: '23:59' },
          { startTime: '00:00', endTime: '01:00' }
        ]
      }]
      expect(checkTimeConflicts(slots)).toBe(false)
    })
  })

  describe('Geçmiş Tarih Tespiti', () => {
    it('geçmiş tarihleri tespit etmeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2023-12-31'), // Dün
        timeSlots: [{ startTime: '09:00', endTime: '10:00' }]
      }]
      expect(hasPastDates(slots)).toBe(true)
    })

    it('mevcut tarihi kabul etmeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-01'), // Bugün
        timeSlots: [{ startTime: '09:00', endTime: '10:00' }]
      }]
      expect(hasPastDates(slots)).toBe(false)
    })

    it('gelecek tarihleri kabul etmeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-02'), // Yarın
        timeSlots: [{ startTime: '09:00', endTime: '10:00' }]
      }]
      expect(hasPastDates(slots)).toBe(false)
    })

    it('karışık dizide geçmiş tarihleri tespit etmeli', () => {
      const slots: DateTimeSlot[] = [
        {
          date: new Date('2024-01-02'), // Gelecek
          timeSlots: [{ startTime: '09:00', endTime: '10:00' }]
        },
        {
          date: new Date('2023-12-31'), // Geçmiş
          timeSlots: [{ startTime: '11:00', endTime: '12:00' }]
        }
      ]
      expect(hasPastDates(slots)).toBe(true)
    })

    it('boş zaman dilimleri dizisini işlemeli', () => {
      const slots: DateTimeSlot[] = []
      expect(hasPastDates(slots)).toBe(false)
    })

    it('tam olarak bir gün öncesini sınır durumu olarak işlemeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2023-12-31T23:59:59'), // Bugünden hemen önce
        timeSlots: [{ startTime: '09:00', endTime: '10:00' }]
      }]
      expect(hasPastDates(slots)).toBe(true)
    })

    it('tam olarak bir gün sonrasını sınır durumu olarak işlemeli', () => {
      const slots: DateTimeSlot[] = [{
        date: new Date('2024-01-02T00:00:01'), // Bugünden hemen sonra
        timeSlots: [{ startTime: '09:00', endTime: '10:00' }]
      }]
      expect(hasPastDates(slots)).toBe(false)
    })
  })

  describe('Geçmiş Zaman Tespiti', () => {
    it('mevcut tarihte geçmiş zamanı tespit etmeli', () => {
      const currentDate = new Date('2024-01-01T12:00:00Z')
      expect(isPastTime(currentDate, '11:00')).toBe(true)
    })

    it('mevcut tarihte gelecek zamanı kabul etmeli', () => {
      const currentDate = new Date('2024-01-01T12:00:00Z')
      expect(isPastTime(currentDate, '13:00')).toBe(false)
    })

    it('tam olarak şu anki zamanı kabul etmeli', () => {
      const currentDate = new Date('2024-01-01T12:00:00Z')
      expect(isPastTime(currentDate, '12:00')).toBe(false)
    })

    it('gelecek tarihlerde herhangi bir zamanı kabul etmeli', () => {
      const futureDate = new Date('2024-01-02')
      expect(isPastTime(futureDate, '09:00')).toBe(false)
      expect(isPastTime(futureDate, '23:59')).toBe(false)
    })

    it('dakika hassasiyetinde geçmiş zamanı tespit etmeli', () => {
      const currentDate = new Date('2024-01-01T12:30:00Z')
      expect(isPastTime(currentDate, '12:29')).toBe(true)
      expect(isPastTime(currentDate, '12:30')).toBe(false)
      expect(isPastTime(currentDate, '12:31')).toBe(false)
    })

    it('gece yarısı etrafındaki sınır durumlarını işlemeli', () => {
      const currentDate = new Date('2024-01-01T00:30:00Z')
      expect(isPastTime(currentDate, '00:29')).toBe(true)
      expect(isPastTime(currentDate, '00:30')).toBe(false)
      expect(isPastTime(currentDate, '00:31')).toBe(false)
    })

    it('öğlen etrafındaki sınır durumlarını işlemeli', () => {
      const currentDate = new Date('2024-01-01T12:00:00Z')
      expect(isPastTime(currentDate, '11:59')).toBe(true)
      expect(isPastTime(currentDate, '12:00')).toBe(false)
      expect(isPastTime(currentDate, '12:01')).toBe(false)
    })

    it('24 saat formatında sınır durumunu işlemeli', () => {
      const currentDate = new Date('2024-01-01T23:30:00Z')
      expect(isPastTime(currentDate, '23:29')).toBe(true)
      expect(isPastTime(currentDate, '23:30')).toBe(false)
      expect(isPastTime(currentDate, '23:31')).toBe(false)
    })
  })

  describe('Zaman Dilimi Aralığı Doğrulama (30 dakika minimum)', () => {
    it('tam olarak 30 dakikalık aralığı kabul etmeli', () => {
      const dateSlot: DateTimeSlot = {
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '10:30', endTime: '11:30' }
        ]
      }
      expect(validateTimeSlotGaps(dateSlot)).toBe(true)
    })

    it('30 dakikadan fazla aralığı kabul etmeli', () => {
      const dateSlot: DateTimeSlot = {
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '11:00', endTime: '12:00' }
        ]
      }
      expect(validateTimeSlotGaps(dateSlot)).toBe(true)
    })

    it('30 dakikadan az aralığı reddetmeli', () => {
      const dateSlot: DateTimeSlot = {
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '10:15', endTime: '11:15' }
        ]
      }
      expect(validateTimeSlotGaps(dateSlot)).toBe(false)
    })

    it('tam olarak 29 dakikalık aralığı reddetmeli', () => {
      const dateSlot: DateTimeSlot = {
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '10:29', endTime: '11:29' }
        ]
      }
      expect(validateTimeSlotGaps(dateSlot)).toBe(false)
    })

    it('tek zaman dilimini kabul etmeli', () => {
      const dateSlot: DateTimeSlot = {
        date: new Date('2024-01-01'),
        timeSlots: [{ startTime: '09:00', endTime: '10:00' }]
      }
      expect(validateTimeSlotGaps(dateSlot)).toBe(true)
    })

    it('boş zaman dilimlerini işlemeli', () => {
      const dateSlot: DateTimeSlot = {
        date: new Date('2024-01-01'),
        timeSlots: []
      }
      expect(validateTimeSlotGaps(dateSlot)).toBe(true)
    })

    it('karışık aralıklı birden fazla dilimi işlemeli', () => {
      const dateSlot: DateTimeSlot = {
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '10:30', endTime: '11:30' }, // 30 dk aralık - TAMAM
          { startTime: '11:45', endTime: '12:45' }  // 15 dk aralık - HATALI
        ]
      }
      expect(validateTimeSlotGaps(dateSlot)).toBe(false)
    })

    it('sıralanmamış zaman dilimlerini işlemeli', () => {
      const dateSlot: DateTimeSlot = {
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '13:00', endTime: '14:00' },
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '10:30', endTime: '11:30' }
        ]
      }
      expect(validateTimeSlotGaps(dateSlot)).toBe(true)
    })

    it('tam olarak sıfır aralık sınır durumunu işlemeli', () => {
      const dateSlot: DateTimeSlot = {
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '10:00', endTime: '11:00' }
        ]
      }
      expect(validateTimeSlotGaps(dateSlot)).toBe(false)
    })

    it('bir dakikalık aralık sınır durumunu işlemeli', () => {
      const dateSlot: DateTimeSlot = {
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '10:01', endTime: '11:01' }
        ]
      }
      expect(validateTimeSlotGaps(dateSlot)).toBe(false)
    })

    it('gün sınırı üzerindeki sınır durumunu işlemeli', () => {
      const dateSlot: DateTimeSlot = {
        date: new Date('2024-01-01'),
        timeSlots: [
          { startTime: '23:00', endTime: '23:30' },
          { startTime: '00:00', endTime: '00:30' } // Gerçekte ertesi gün olacak
        ]
      }
      // Bu çok büyük bir aralık olarak değerlendirilmeli (negatif zaman farkı)
      expect(validateTimeSlotGaps(dateSlot)).toBe(true)
    })
  })
}) 