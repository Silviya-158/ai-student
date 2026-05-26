export default function MessageBubble({ text, from = 'bot' }) {
  const isBot = from === 'bot'
  
  return (
    <div className={`message-container ${isBot ? 'from-bot' : 'from-user'}`}>
      <div className="message-avatar">
        {isBot ? '✨' : '👤'}
      </div>
      <div className={"message-bubble " + (isBot ? 'from-bot' : 'from-user')}>
        <div className="bubble-inner">
          <div className="bubble-text">{text}</div>
        </div>
      </div>
    </div>
  )
}
