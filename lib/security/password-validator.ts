export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  score: number
}

export class PasswordValidator {
  private minLength: number = 8
  private requireUppercase: boolean = true
  private requireLowercase: boolean = true
  private requireNumbers: boolean = true
  private requireSpecialChars: boolean = true
  private commonPasswords: Set<string>

  constructor() {
    // Common weak passwords to check against
    this.commonPasswords = new Set([
      'password', '12345678', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890',
      'password1', 'qwerty123', 'abc12345', 'Password1', 'password!'
    ])
  }

  validate(password: string): PasswordValidationResult {
    const errors: string[] = []
    let score = 0

    // Check length
    if (password.length < this.minLength) {
      errors.push(`비밀번호는 최소 ${this.minLength}자 이상이어야 합니다.`)
    } else {
      score += 20
      if (password.length >= 12) score += 10
      if (password.length >= 16) score += 10
    }

    // Check uppercase
    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('대문자를 포함해야 합니다.')
    } else if (/[A-Z]/.test(password)) {
      score += 15
    }

    // Check lowercase
    if (this.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('소문자를 포함해야 합니다.')
    } else if (/[a-z]/.test(password)) {
      score += 15
    }

    // Check numbers
    if (this.requireNumbers && !/\d/.test(password)) {
      errors.push('숫자를 포함해야 합니다.')
    } else if (/\d/.test(password)) {
      score += 15
    }

    // Check special characters
    if (this.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('특수문자를 포함해야 합니다.')
    } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 15
    }

    // Check for common passwords
    if (this.commonPasswords.has(password.toLowerCase())) {
      errors.push('너무 일반적인 비밀번호입니다.')
      score = Math.max(0, score - 30)
    }

    // Check for sequential characters
    if (this.hasSequentialChars(password)) {
      errors.push('연속된 문자나 숫자는 사용할 수 없습니다.')
      score = Math.max(0, score - 10)
    }

    // Check for repeated characters
    if (this.hasRepeatedChars(password)) {
      errors.push('반복된 문자는 사용할 수 없습니다.')
      score = Math.max(0, score - 10)
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(100, score)
    }
  }

  private hasSequentialChars(password: string): boolean {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '0123456789',
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm'
    ]

    const lowerPassword = password.toLowerCase()
    for (const seq of sequences) {
      for (let i = 0; i < seq.length - 2; i++) {
        const subSeq = seq.substring(i, i + 3)
        if (lowerPassword.includes(subSeq)) {
          return true
        }
      }
    }
    return false
  }

  private hasRepeatedChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return true
      }
    }
    return false
  }

  getStrengthLabel(score: number): string {
    if (score < 20) return '매우 약함'
    if (score < 40) return '약함'
    if (score < 60) return '보통'
    if (score < 80) return '강함'
    return '매우 강함'
  }

  generateStrongPassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    const allChars = uppercase + lowercase + numbers + special
    let password = ''
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }
}

export const passwordValidator = new PasswordValidator()