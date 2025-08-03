import React from 'react';
import '../pages/HelpPage.css';

const HelpModalContent: React.FC = () => {
  return (
    <div className="help-content"
         style={{ padding: '1.5rem', backgroundColor: '#1a2332' }}>
        {/* Quick Start Section */}
        <section className="help-section">
          <h2>🚀 Quick Start Guide</h2>
          <div className="quick-start-grid">
            <div className="quick-start-card">
              <div className="step-number">1</div>
              <h3>Create or Join Room</h3>
              <p>Host creates a room with settings, others join with room code</p>
            </div>
            <div className="quick-start-card">
              <div className="step-number">2</div>
              <h3>Set Up Players</h3>
              <p>Choose avatars, set initial balances and betting amounts</p>
            </div>
            <div className="quick-start-card">
              <div className="step-number">3</div>
              <h3>Start Playing</h3>
              <p>Host starts the game, follow betting rounds, track pot automatically</p>
            </div>
          </div>
        </section>

        {/* Poker Rules Section */}
        <section className="help-section">
          <h2>🎯 Texas Hold'em Poker Rules</h2>
          
          <div className="rules-subsection">
            <h3>🔄 Game Setup (2-8 Players)</h3>
            <div className="setup-positions">
              <div className="position-example">
                <h4>Example with 5 Players:</h4>
                <div className="position-layout">
                  <ul>
                    <li><strong>Seat 1:</strong> Dealer (Button) 🟢</li>
                    <li><strong>Seat 2:</strong> Small Blind (SB) 💰</li>
                    <li><strong>Seat 3:</strong> Big Blind (BB) 💰💰</li>
                    <li><strong>Seat 4:</strong> Under The Gun (UTG)</li>
                    <li><strong>Seat 5:</strong> Cut-off</li>
                  </ul>
                  <p className="note">💡 Dealer button moves clockwise after each hand</p>
                </div>
              </div>
            </div>

            <div className="rules-subsection">
              <h3>💰 Betting Rounds</h3>
              <div className="betting-rounds">
                <div className="round-card">
                  <h4>1️⃣ Pre-Flop</h4>
                  <p><strong>Cards:</strong> 2 hole cards dealt to each player</p>
                  <p><strong>Blinds:</strong> Small Blind & Big Blind posted</p>
                  <p><strong>First to Act:</strong> Player left of Big Blind (UTG)</p>
                  <div className="actions">
                    <span className="action-chip fold">Fold</span>
                    <span className="action-chip call">Call</span>
                    <span className="action-chip raise">Raise</span>
                  </div>
                </div>

                <div className="round-card">
                  <h4>2️⃣ Flop</h4>
                  <p><strong>Cards:</strong> First 3 community cards</p>
                  <p><strong>First to Act:</strong> Player left of dealer (still in hand)</p>
                  <p><strong>Betting:</strong> Check, Bet, Call, Raise, or Fold</p>
                </div>

                <div className="round-card">
                  <h4>3️⃣ Turn</h4>
                  <p><strong>Cards:</strong> 4th community card</p>
                  <p><strong>Betting:</strong> Same as Flop</p>
                </div>

                <div className="round-card">
                  <h4>4️⃣ River</h4>
                  <p><strong>Cards:</strong> 5th and final community card</p>
                  <p><strong>Betting:</strong> Final betting round</p>
                </div>

                <div className="round-card">
                  <h4>5️⃣ Showdown</h4>
                  <p><strong>Winner:</strong> Best 5-card hand using hole cards + community cards</p>
                  <p><strong>Pot:</strong> Winner takes all chips</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Player Actions Section */}
        <section className="help-section">
          <h2>🎮 Player Actions</h2>
          <div className="actions-grid">
            <div className="action-card">
              <h3>🚪 Fold</h3>
              <p>Give up your hand and forfeit any chance of winning the pot. You cannot act again this hand.</p>
            </div>

            <div className="action-card">
              <h3>✅ Check</h3>
              <p>Pass the action to the next player without betting. Only available when no bet has been made.</p>
            </div>

            <div className="action-card">
              <h3>💰 Call</h3>
              <p>Match the current highest bet to stay in the hand.</p>
            </div>

            <div className="action-card">
              <h3>📈 Raise</h3>
              <p>Increase the bet amount. Other players must call, raise, or fold.</p>
            </div>

            <div className="action-card">
              <h3>👁️ Seen</h3>
              <p>Look at your cards and bet double the minimum amount. (Indian Poker variant)</p>
            </div>

            <div className="action-card">
              <h3>🎲 Blind</h3>
              <p>Bet without looking at your cards. Bet the minimum amount. (Indian Poker variant)</p>
            </div>
          </div>
        </section>

        {/* Pot Calculator Features */}
        <section className="help-section">
          <h2>🧮 Pot Calculator Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>💳 Balance Tracking</h3>
              <ul>
                <li>Automatic balance updates</li>
                <li>Real-time pot calculations</li>
                <li>Host can adjust balances</li>
              </ul>
            </div>

            <div className="feature-card">
              <h3>🎯 Game Management</h3>
              <ul>
                <li>Automatic dealer rotation</li>
                <li>Blind posting</li>
                <li>Turn management</li>
                <li>Round progression</li>
              </ul>
            </div>

            <div className="feature-card">
              <h3>👥 Multiplayer</h3>
              <ul>
                <li>2-8 players supported</li>
                <li>Real-time synchronization</li>
                <li>Host controls</li>
                <li>Player reconnection</li>
              </ul>
            </div>

            <div className="feature-card">
              <h3>🔧 Host Features</h3>
              <ul>
                <li>Room settings control</li>
                <li>Balance management</li>
                <li>Game start/stop</li>
                <li>Player management</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="help-section">
          <h2>💡 Pro Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h3>🎯 For New Players</h3>
              <ul>
                <li>Start with smaller bets to learn</li>
                <li>Watch other players' betting patterns</li>
                <li>Don't be afraid to fold weak hands</li>
                <li>Pay attention to position</li>
              </ul>
            </div>

            <div className="tip-card">
              <h3>👑 For Hosts</h3>
              <ul>
                <li>Set appropriate initial balances</li>
                <li>Explain rules to new players</li>
                <li>Monitor game progress</li>
                <li>Use balance adjustment features wisely</li>
              </ul>
            </div>

            <div className="tip-card">
              <h3>🧮 Using the Calculator</h3>
              <ul>
                <li>All calculations are automatic</li>
                <li>Focus on the game, not the math</li>
                <li>Check pot size before big decisions</li>
                <li>Track your balance throughout</li>
              </ul>
            </div>

            <div className="tip-card">
              <h3>🎮 Game Etiquette</h3>
              <ul>
                <li>Act when it's your turn</li>
                <li>Declare your actions clearly</li>
                <li>Be respectful to other players</li>
                <li>Keep the game moving</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="help-section">
          <h2>❓ Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Q: How do I join a room?</h3>
              <p>A: Get the room code from the host and enter it on the "Join Room" page along with your username and avatar.</p>
            </div>

            <div className="faq-item">
              <h3>Q: Can I change settings during a game?</h3>
              <p>A: No, room settings can only be changed when the game is not in progress. Balances can be adjusted by the host.</p>
            </div>

            <div className="faq-item">
              <h3>Q: What happens if I disconnect?</h3>
              <p>A: You can reconnect using the same room code and username. Your balance and position are preserved.</p>
            </div>

            <div className="faq-item">
              <h3>Q: How does the pot calculator work?</h3>
              <p>A: All bets, pot sizes, and balance updates are calculated automatically. Just focus on playing!</p>
            </div>

            <div className="faq-item">
              <h3>Q: Can I play with more than 8 players?</h3>
              <p>A: No, the maximum is 8 players for optimal game experience and performance.</p>
            </div>

            <div className="faq-item">
              <h3>Q: What's the difference between Seen and Blind?</h3>
              <p>A: Seen means you look at your cards and bet double. Blind means you bet without looking at your cards.</p>
            </div>
          </div>
        </section>
    </div>
  );
};

export default HelpModalContent;
