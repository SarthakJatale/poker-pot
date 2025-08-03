import React from 'react';
import { useAppNavigation } from '../../../shared/hooks';
import './HelpPage.css';

const HelpPage: React.FC = () => {
  const { goHome } = useAppNavigation();

  return (
    <div className="help-page">
      <div className="help-container">
        <header className="help-header">
          <button onClick={goHome} className="back-button">
            ← Back to Home
          </button>
          <h1>🃏 Poker Pot Calculator - Help & Rules</h1>
          <p>Learn how to play poker and use the pot calculator</p>
        </header>

        <div className="help-content">
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
                  <ul>
                    <li><strong>Seat 1:</strong> Dealer (D) 🔘</li>
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
                    <span className="action-chip call">Call BB</span>
                    <span className="action-chip raise">Raise</span>
                  </div>
                </div>

                <div className="round-card">
                  <h4>2️⃣ Flop</h4>
                  <p><strong>Cards:</strong> 3 community cards revealed</p>
                  <p><strong>First to Act:</strong> Small Blind (or next active player)</p>
                  <div className="actions">
                    <span className="action-chip check">Check</span>
                    <span className="action-chip bet">Bet</span>
                    <span className="action-chip call">Call</span>
                    <span className="action-chip raise">Raise</span>
                    <span className="action-chip fold">Fold</span>
                  </div>
                </div>

                <div className="round-card">
                  <h4>3️⃣ Turn</h4>
                  <p><strong>Cards:</strong> 4th community card revealed</p>
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
                  <li>Room-based gameplay</li>
                  <li>Host controls</li>
                </ul>
              </div>

              <div className="feature-card">
                <h3>⚙️ Customization</h3>
                <ul>
                  <li>Set initial balances</li>
                  <li>Configure bet amounts</li>
                  <li>Choose avatars</li>
                  <li>Room settings</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Host Controls */}
          <section className="help-section">
            <h2>👑 Host Controls</h2>
            <div className="host-controls">
              <div className="control-group">
                <h3>🎮 Game Controls</h3>
                <ul>
                  <li><strong>Start Game:</strong> Begin a new poker hand</li>
                  <li><strong>Room Settings:</strong> Modify game parameters</li>
                  <li><strong>Player Management:</strong> Add/remove players</li>
                </ul>
              </div>

              <div className="control-group">
                <h3>💰 Balance Management</h3>
                <ul>
                  <li><strong>Update Balances:</strong> Adjust player chip counts</li>
                  <li><strong>Initial Settings:</strong> Set starting balances</li>
                  <li><strong>Bet Amounts:</strong> Configure minimum bets</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tips for Beginners */}
          <section className="help-section">
            <h2>💡 Tips for Beginners</h2>
            <div className="tips-grid">
              <div className="tip-card">
                <h3>🎯 Starting Hands</h3>
                <p>Don't play every hand. Fold weak starting hands to save chips for stronger hands.</p>
              </div>

              <div className="tip-card">
                <h3>📊 Position Matters</h3>
                <p>Players acting later have more information. Use position to your advantage.</p>
              </div>

              <div className="tip-card">
                <h3>👀 Watch Opponents</h3>
                <p>Observe betting patterns and player behavior for valuable information.</p>
              </div>

              <div className="tip-card">
                <h3>💰 Bankroll Management</h3>
                <p>Don't bet more than you can afford to lose. Manage your chips wisely.</p>
              </div>

              <div className="tip-card">
                <h3>🎭 Bluffing</h3>
                <p>Bluff strategically, not constantly. Good bluffs can win pots with weak hands.</p>
              </div>

              <div className="tip-card">
                <h3>📚 Keep Learning</h3>
                <p>Poker is a game of skill. Practice and study to improve your game.</p>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="help-section">
            <h2>🔧 Troubleshooting</h2>
            <div className="troubleshooting">
              <div className="issue-card">
                <h3>❌ Connection Issues</h3>
                <ul>
                  <li>Refresh the page if disconnected</li>
                  <li>Check your internet connection</li>
                  <li>Try rejoining the room</li>
                </ul>
              </div>

              <div className="issue-card">
                <h3>🎮 Game Issues</h3>
                <ul>
                  <li>Only the host can start games</li>
                  <li>Need at least 2 players to start</li>
                  <li>Wait for your turn to act</li>
                </ul>
              </div>

              <div className="issue-card">
                <h3>💰 Balance Issues</h3>
                <ul>
                  <li>Host can adjust balances</li>
                  <li>Balances update automatically</li>
                  <li>Contact host for corrections</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <footer className="help-footer">
          <button onClick={goHome} className="home-button">
            🏠 Back to Home
          </button>
          <p>Ready to play? Join or create a room to get started!</p>
        </footer>
      </div>
    </div>
  );
};

export default HelpPage;
