/**
 * Marathon Squad Hub - Quản lý Đăng ký Nhóm đua Marathon Đồng đội 42km & 21km
 * Athletic sports aesthetic: Orange/Red Flame & Dark Navy
 * Exact database schema mapping:
 * - Table 'teams': id, user_id, name, passcode, category, captain_name, captain_phone, captain_email, status, created_at
 * - Table 'team_members': id, user_id, team_id, bib_number, full_name, gender, distance, role, joined_at
 */

import React, { useState, useEffect } from 'react';
import { ActiveScreen, Team, TeamMember, UserSession } from './types';
import { api, getCurrentUser } from './lib/database';
import { getStoredSupabaseConfig } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { RulesModal } from './components/RulesModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { TeamDetailModal } from './components/TeamDetailModal';
import { TeamDirectory } from './components/screens/TeamDirectory';
import { CreateTeam } from './components/screens/CreateTeam';
import { JoinTeam } from './components/screens/JoinTeam';
import { Flame, RefreshCw, Trophy } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('directory');
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Active user session
  const [currentUser, setCurrentUserState] = useState<UserSession>(getCurrentUser());

  // Modals
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [targetJoinTeamId, setTargetJoinTeamId] = useState<string | undefined>(undefined);

  // Supabase state
  const [supabaseConfig, setSupabaseConfig] = useState(getStoredSupabaseConfig());

  // Load all teams and members
  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTeams, allMembers] = await Promise.all([
        api.getTeams(),
        api.getAllMembers(),
      ]);
      setTeams(fetchedTeams);
      setMembers(allMembers);

      // If a team is currently viewed, refresh its instance
      if (selectedTeam) {
        const refreshed = fetchedTeams.find((t) => t.id === selectedTeam.id);
        if (refreshed) setSelectedTeam(refreshed);
      }
    } catch (e) {
      console.warn('Error loading marathon data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfigSaved = () => {
    setSupabaseConfig(getStoredSupabaseConfig());
    loadData();
  };

  const handleTeamCreated = (newTeam: Team) => {
    loadData();
    setSelectedTeam(newTeam);
    setCurrentScreen('directory');
  };

  const handleJoined = (team: Team) => {
    loadData();
    setSelectedTeam(team);
    setCurrentScreen('directory');
  };

  const handleNavigateToJoinWithTeam = (teamId: string) => {
    setTargetJoinTeamId(teamId);
    setCurrentScreen('join');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#9f224e] selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          setTargetJoinTeamId(undefined);
        }}
        currentUser={currentUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseOpen(true)}
        onOpenRulesModal={() => setIsRulesOpen(true)}
        isSupabaseConfigured={supabaseConfig.isConfigured}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {loading && teams.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-8 h-8 text-[#9f224e] animate-spin" />
            <p className="text-xs uppercase tracking-wider font-semibold">
              Đang tải danh sách đội đua...
            </p>
          </div>
        ) : (
          <>
            {/* Screen 1: Team Directory & Overview */}
            {currentScreen === 'directory' && (
              <TeamDirectory
                teams={teams}
                members={members}
                onSelectTeam={(team) => setSelectedTeam(team)}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            )}

            {/* Screen 2: Create Team */}
            {currentScreen === 'create' && (
              <CreateTeam
                currentUser={currentUser}
                teams={teams}
                members={members}
                onTeamCreated={handleTeamCreated}
                onCancel={() => setCurrentScreen('directory')}
              />
            )}

            {/* Screen 3: Join Team */}
            {currentScreen === 'join' && (
              <JoinTeam
                teams={teams}
                members={members}
                currentUser={currentUser}
                initialTeamId={targetJoinTeamId}
                onJoined={handleJoined}
                onRefreshData={loadData}
                onCancel={() => {
                  setCurrentScreen('directory');
                  setTargetJoinTeamId(undefined);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Team Detail Modal (Available from any screen or directory card) */}
      {selectedTeam && (
        <TeamDetailModal
          team={selectedTeam}
          members={members.filter((m) => m.team_id === selectedTeam.id)}
          currentUser={currentUser}
          onClose={() => setSelectedTeam(null)}
          onRefresh={loadData}
          onNavigateToJoin={handleNavigateToJoinWithTeam}
        />
      )}

      {/* Modals */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      <SupabaseConfigModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        onConfigSaved={handleConfigSaved}
      />

      <UserSwitcherModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={(user) => {
          setCurrentUserState(user);
          loadData();
        }}
      />
    </div>
  );
}
