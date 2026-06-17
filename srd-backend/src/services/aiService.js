// AI Service for Smart Ticket Assistant
const categoryKeywords = {
  bug: ['error', 'crash', 'bug', 'not working', 'broken', 'fails', 'issue', 'problem', 'glitch', 'freeze', 'hang', 'slow', 'performance'],
  feature: ['suggestion', 'idea', 'improve', 'add', 'enhance', 'new feature', 'would like', 'wish', 'recommend'],
  support: ['help', 'how to', 'guide', 'tutorial', 'explain', 'step', 'process', 'need assistance', 'confused'],
  billing: ['payment', 'invoice', 'bill', 'charge', 'refund', 'price', 'cost', 'subscription', 'plan', 'upgrade', 'downgrade'],
  general: ['question', 'inquiry', 'info', 'information', 'clarify', 'details']
};

const priorityKeywords = {
  urgent: ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'down', 'blocked', 'cannot work', 'stopped', 'halt'],
  high: ['important', 'quick', 'soon', 'frustrating', 'unacceptable', 'repeat', 'again', 'still'],
  medium: ['normal', 'regular', 'standard', 'eventually'],
  low: ['minor', 'small', 'typo', 'cosmetic', 'whenever', 'not urgent', 'suggestion']
};

const sentimentKeywords = {
  angry: ['angry', 'furious', 'terrible', 'worst', 'useless', 'waste', 'horrible', 'awful', 'disgusting', 'hate', 'unacceptable', 'frustrated', 'annoying'],
  frustrated: ['frustrated', 'disappointed', 'upset', 'fed up', 'tired of', 'sick of', 'annoyed'],
  urgent_negative: ['losing money', 'customers leaving', 'business impact', 'emergency', 'critical', 'down'],
  positive: ['thanks', 'appreciate', 'great', 'excellent', 'awesome', 'good', 'helpful', 'love', 'satisfied']
};

class AIService {
  detectCategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    let scores = { bug: 0, feature: 0, support: 0, billing: 0, general: 5 };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) scores[category] += 2;
      }
    }

    let detectedCategory = 'general';
    let highestScore = 0;
    for (const [category, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        detectedCategory = category;
      }
    }
    return detectedCategory;
  }

  detectPriority(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    let scores = { urgent: 0, high: 0, medium: 5, low: 0 };

    for (const [priority, keywords] of Object.entries(priorityKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) scores[priority] += 3;
      }
    }
    if (text.includes('urgent') || text.includes('asap') || text.includes('emergency')) scores.urgent += 5;

    if (scores.urgent >= 5) return 'urgent';
    if (scores.high >= 3) return 'high';
    if (scores.medium >= 5) return 'medium';
    return 'low';
  }

  analyzeSentiment(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    let sentiment = { isAngry: false, isFrustrated: false, isUrgent: false, isPositive: false, score: 0, level: 'neutral' };

    for (const word of sentimentKeywords.angry) {
      if (text.includes(word)) { sentiment.isAngry = true; sentiment.score += 10; }
    }
    for (const word of sentimentKeywords.frustrated) {
      if (text.includes(word)) { sentiment.isFrustrated = true; sentiment.score += 5; }
    }
    for (const word of sentimentKeywords.urgent_negative) {
      if (text.includes(word)) { sentiment.isUrgent = true; sentiment.score += 8; }
    }
    for (const word of sentimentKeywords.positive) {
      if (text.includes(word)) { sentiment.isPositive = true; sentiment.score -= 3; }
    }

    if (sentiment.score >= 15) sentiment.level = 'critical';
    else if (sentiment.score >= 8) sentiment.level = 'negative';
    else if (sentiment.score <= -3) sentiment.level = 'positive';

    return sentiment;
  }

  predictResolutionTime(priority, category, sentiment) {
    const baseTime = { urgent: 1, high: 4, medium: 24, low: 48 };
    let time = baseTime[priority] || 24;
    if (sentiment.level === 'critical') time = time * 0.5;
    if (sentiment.level === 'negative') time = time * 0.8;
    if (sentiment.level === 'positive') time = time * 1.2;
    if (category === 'bug') time = time * 0.8;
    if (category === 'billing') time = time * 0.9;
    return Math.max(1, Math.min(72, Math.round(time)));
  }

  getTicketInsights(ticket) {
    return {
      category: this.detectCategory(ticket.title, ticket.description),
      priority: this.detectPriority(ticket.title, ticket.description),
      sentiment: this.analyzeSentiment(ticket.title, ticket.description),
      estimatedResolution: this.predictResolutionTime(
        this.detectPriority(ticket.title, ticket.description),
        this.detectCategory(ticket.title, ticket.description),
        this.analyzeSentiment(ticket.title, ticket.description)
      )
    };
  }
}

module.exports = new AIService();