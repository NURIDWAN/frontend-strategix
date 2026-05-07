import React, { useMemo } from 'react';
import { Users } from 'lucide-react';

const OrgChart = ({ teamMembers = [] }) => {
    // Hierarchy levels - Priority order
    const hierarchyLevels = [
        'Owner', 'CEO', 'Founder', 'Direktur', 'Director',
        'Manager', 'Lead', 'Supervisor', 'Koordinator',
        'Staff', 'Karyawan', 'Employee', 'Anggota'
    ];

    // Group members by category
    const organizeTeam = useMemo(() => {
        if (!teamMembers || teamMembers.length === 0) return {};

        const grouped = {};
        teamMembers.forEach(member => {
            const category = member.team_category || 'Other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(member);
        });

        const sorted = {};
        hierarchyLevels.forEach(level => {
            if (grouped[level]) {
                sorted[level] = grouped[level];
            }
        });

        Object.keys(grouped).forEach(category => {
            if (!sorted[category]) {
                sorted[category] = grouped[category];
            }
        });

        return sorted;
    }, [teamMembers]);

    const getLevelColor = (level) => {
        const colorMap = {
            'Owner': 'bg-red-600',
            'CEO': 'bg-red-500',
            'Founder': 'bg-orange-600',
            'Direktur': 'bg-orange-500',
            'Director': 'bg-orange-500',
            'Manager': 'bg-blue-600',
            'Lead': 'bg-blue-500',
            'Supervisor': 'bg-green-600',
            'Koordinator': 'bg-green-500',
            'Staff': 'bg-purple-600',
            'Karyawan': 'bg-purple-500',
            'Employee': 'bg-purple-500',
            'Anggota': 'bg-gray-600',
            'Other': 'bg-gray-500'
        };
        return colorMap[level] || 'bg-gray-500';
    };

    if (Object.keys(organizeTeam).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <Users size={48} className="text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                    Belum ada data struktur organisasi.
                </p>
            </div>
        );
    }

    const levels = Object.entries(organizeTeam);

    return (
        <div className="w-full bg-gradient-to-b from-slate-900 to-slate-800 p-8 rounded-lg relative">
            <svg width="100%" height={Math.max(600, levels.length * 180)} className="absolute top-0 left-0 pointer-events-none">
                <defs>
                    <style>
                        {`
                            .org-line { stroke: #818cf8; stroke-width: 2; }
                            .org-arrow { fill: #818cf8; }
                        `}
                    </style>
                </defs>
            </svg>

            <div className="relative z-10 flex flex-col items-center gap-8">
                {levels.map((entry, levelIndex) => {
                    const [category, members] = entry;
                    const bgColor = getLevelColor(category);

                    return (
                        <div key={category} className="flex flex-col items-center w-full">
                            {/* Cards container - centered */}
                            <div className="flex flex-wrap gap-4 justify-center">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className={`${bgColor} text-white rounded-lg px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-200 w-40 text-center border border-white/10`}
                                    >
                                        {/* Name */}
                                        <h5 className="font-bold text-sm line-clamp-2 mb-2">
                                            {member.member_name}
                                        </h5>

                                        {/* Position */}
                                        <p className="text-white/90 text-xs font-medium">
                                            {member.position}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Connector to next level */}
                            {levelIndex < levels.length - 1 && (
                                <div className="flex flex-col items-center mt-4">
                                    {/* Vertical line down */}
                                    <svg width="2" height="20" className="block" viewBox="0 0 2 20">
                                        <line x1="1" y1="0" x2="1" y2="20" className="org-line" />
                                    </svg>
                                    
                                    {/* Arrow down */}
                                    <svg width="24" height="20" viewBox="0 0 24 20" className="block">
                                        <path d="M 12 0 L 12 15 M 8 10 L 12 15 L 16 10" className="org-line" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrgChart;

