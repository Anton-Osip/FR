export enum PromoErrorCode {
  PROMO_UNAVAILABLE = 'promo_unavailable',
  INVALID_CODE_FORMAT = 'invalid_code_format',
  INVALID_PARAMS = 'invalid_params',
  LIMIT_RESTRICTED = 'limit_restricted',
  ALREADY_USED = 'already_used',
  PROMO_INACTIVE = 'promo_inactive',
  RESERVED_EXISTS = 'reserved_exists',
  TOO_MANY_CAMPAIGNS = 'too_many_campaigns',
  ISSUE_FAILED = 'issue_failed',
  FORBIDDEN = 'forbidden',
  PARTNER_FORBIDDEN = 'partner_forbidden',
  NEW_USERS_ONLY = 'new_users_only',
  RESPONSE_MAPPING_ERROR = 'response_mapping_error',
  ALREADY_EXISTS = 'already_exists',
}

export const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<PromoErrorCode, string> = {
    [PromoErrorCode.PROMO_UNAVAILABLE]: 'Неверный промокод. Пожалуйста, проверьте правильность ввода.',
    [PromoErrorCode.INVALID_CODE_FORMAT]: 'Неверный промокод. Пожалуйста, проверьте правильность ввода.',
    [PromoErrorCode.INVALID_PARAMS]: 'Промокод не подходит. Проверьте условия и попробуйте снова.',
    [PromoErrorCode.LIMIT_RESTRICTED]:
      'Лимит на активацию промокодов исчерпан. Пополните баланс, чтобы увеличить лимит.',
    [PromoErrorCode.ALREADY_USED]: 'Вы уже использовали этот промокод.',
    [PromoErrorCode.PROMO_INACTIVE]: 'Промокод сейчас неактивен.',
    [PromoErrorCode.RESERVED_EXISTS]: 'У вас уже есть активный промо-депозит.',
    [PromoErrorCode.TOO_MANY_CAMPAIGNS]:
      'Лимит: не более 5 активных наборов фриспинов. Доиграйте текущие и попробуйте снова.',
    [PromoErrorCode.ISSUE_FAILED]: 'Не удалось выдать награду. Попробуйте позже.',
    [PromoErrorCode.FORBIDDEN]: 'Промокод недоступен для вашего аккаунта.',
    [PromoErrorCode.PARTNER_FORBIDDEN]: 'Промокод недоступен для вашего аккаунта.',
    [PromoErrorCode.NEW_USERS_ONLY]: 'Промокод доступен только новым пользователям.',
    [PromoErrorCode.RESPONSE_MAPPING_ERROR]: 'Ошибка активации. Попробуйте позже.',
    [PromoErrorCode.ALREADY_EXISTS]:
      'У вас уже активированы фриспины для этого слота. Сначала используйте их, а затем активируйте новый промокод.',
  };

  return errorMessages[errorCode as PromoErrorCode] || 'Произошла ошибка. Попробуйте позже.';
};
