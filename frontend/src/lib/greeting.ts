interface WelcomeOptions {
  userName?: string;
  isReturningUser?: boolean;
  productParam?: string | null;
}

export function generateWelcomeMessage(options: WelcomeOptions = {}): string {
  const { userName, isReturningUser, productParam } = options;

  if (productParam) {
    return `Hello${userName ? ` ${userName}` : ''}! Tell me what you'd like to know about the **${productParam}**, or how you'd like to integrate it into your electronics project.`;
  }

  if (userName) {
    if (isReturningUser) {
      return `Welcome back, **${userName}**! How can I assist you with your robotics, electronics, or DigiComp components today?`;
    }
    return `Hello **${userName}**! Welcome to DigiComp AI. I can help you choose microcontrollers, sensors, motor drivers, and components for your projects. What are you building today?`;
  }

  if (isReturningUser) {
    return `Welcome back! How can I help you with your electronics projects or product recommendations today?`;
  }

  return `Hello! Welcome to **DigiComp AI Assistant**. I can help you find components, design robotics systems, and recommend parts from our catalog. What would you like to build?`;
}
