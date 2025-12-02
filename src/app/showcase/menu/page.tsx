'use client';

import { useState } from 'react';
import {
  Menu,
  MenuItem,
  MenuDivider,
  MenuSection,
} from '@pointwise/app/components/ui/menus';
import { Card } from '@pointwise/app/components/ui/Card';
import { Button } from '@pointwise/app/components/ui/Button';
import BackgroundGlow from '@pointwise/app/components/general/BackgroundGlow';
import {
  FiUser,
  FiSettings,
  FiLogOut,
  FiHome,
  FiMail,
  FiStar,
  FiEdit,
  FiMoreVertical,
  FiChevronDown,
  FiBell,
} from 'react-icons/fi';

export default function MenuShowcasePage() {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-16">
        <div>
          <h1 className="text-3xl font-bold mb-2">Menu Component</h1>
          <p className="text-sm text-zinc-400">
            A flexible dropdown menu component with composition-based API
          </p>
        </div>

        {/* Basic Usage */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Basic Usage</h2>
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Menu triggerLabel="User Menu">
                  <MenuItem label="Profile" icon={<FiUser />} href="/profile" />
                  <MenuItem
                    label="Settings"
                    icon={<FiSettings />}
                    href="/settings"
                  />
                  <MenuDivider />
                  <MenuItem
                    label="Sign out"
                    icon={<FiLogOut />}
                    onClick={() => setSelectedAction('Sign out clicked')}
                    danger
                  />
                </Menu>
                {selectedAction && (
                  <p className="text-sm text-zinc-400">
                    Last action:{' '}
                    <span className="font-semibold text-zinc-200">
                      {selectedAction}
                    </span>
                  </p>
                )}
              </div>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<Menu triggerLabel="User Menu">
  <MenuItem label="Profile" icon={<FiUser />} href="/profile" />
  <MenuItem label="Settings" icon={<FiSettings />} href="/settings" />
  <MenuDivider />
  <MenuItem 
    label="Sign out" 
    icon={<FiLogOut />} 
    onClick={() => handleSignOut()}
    danger 
  />
</Menu>`}</code>
              </pre>
            </div>
          </Card>
        </section>

        {/* Variants & Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Variants & Sizes
          </h2>
          <Card variant="primary" responsivePadding>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-3">
                  Variants
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Menu variant="primary" triggerLabel="Primary">
                    <MenuItem label="Item 1" icon={<FiHome />} href="/" />
                    <MenuItem label="Item 2" icon={<FiUser />} href="/" />
                  </Menu>
                  <Menu variant="secondary" triggerLabel="Secondary">
                    <MenuItem label="Item 1" icon={<FiHome />} href="/" />
                    <MenuItem label="Item 2" icon={<FiUser />} href="/" />
                  </Menu>
                  <Menu variant="danger" triggerLabel="Danger">
                    <MenuItem label="Item 1" icon={<FiHome />} href="/" />
                    <MenuItem label="Item 2" icon={<FiUser />} href="/" />
                  </Menu>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-3">
                  Sizes
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Menu size="sm" triggerLabel="Small">
                    <MenuItem label="Item 1" icon={<FiHome />} href="/" />
                    <MenuItem label="Item 2" icon={<FiUser />} href="/" />
                  </Menu>
                  <Menu size="md" triggerLabel="Medium">
                    <MenuItem label="Item 1" icon={<FiHome />} href="/" />
                    <MenuItem label="Item 2" icon={<FiUser />} href="/" />
                  </Menu>
                  <Menu size="lg" triggerLabel="Large">
                    <MenuItem label="Item 1" icon={<FiHome />} href="/" />
                    <MenuItem label="Item 2" icon={<FiUser />} href="/" />
                  </Menu>
                </div>
              </div>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<Menu variant="primary" size="md" triggerLabel="Menu">
  <MenuItem label="Item" icon={<Icon />} href="/" />
</Menu>`}</code>
              </pre>
            </div>
          </Card>
        </section>

        {/* Features */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Features</h2>

          {/* Badges & Notifications */}
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Badges & Notifications
              </h3>
              <Menu triggerLabel="With Badges" triggerBadgeCount={15}>
                <MenuItem
                  label="Messages"
                  icon={<FiMail />}
                  href="/messages"
                  badgeCount={3}
                />
                <MenuItem
                  label="Notifications"
                  icon={<FiBell />}
                  href="/notifications"
                  badgeCount={12}
                />
                <MenuItem
                  label="Custom Badge"
                  icon={<FiStar />}
                  href="/"
                  badge={
                    <span className="inline-flex items-center rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-200">
                      New
                    </span>
                  }
                />
              </Menu>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<Menu triggerLabel="Menu" triggerBadgeCount={15}>
  <MenuItem 
    label="Messages" 
    icon={<FiMail />} 
    badgeCount={3} 
  />
  <MenuItem 
    label="Custom" 
    badge={<span>New</span>} 
  />
</Menu>`}</code>
              </pre>
            </div>
          </Card>

          {/* Descriptions */}
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Item Descriptions
              </h3>
              <Menu triggerLabel="With Descriptions">
                <MenuItem
                  label="Settings"
                  description="Manage your preferences"
                  icon={<FiSettings />}
                  onClick={() => setSelectedAction('Settings clicked')}
                />
                <MenuItem
                  label="Profile"
                  description="View and edit your profile"
                  icon={<FiUser />}
                  onClick={() => setSelectedAction('Profile clicked')}
                />
              </Menu>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<MenuItem
  label="Settings"
  description="Manage your preferences"
  icon={<FiSettings />}
  onClick={() => {}}
/>`}</code>
              </pre>
            </div>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Keyboard Shortcuts
              </h3>
              <Menu triggerLabel="With Shortcuts">
                <MenuItem
                  label="New Task"
                  icon={<FiEdit />}
                  shortcut="Ctrl+K"
                  onClick={() => setSelectedAction('New Task')}
                />
                <MenuItem
                  label="Search"
                  icon={<FiHome />}
                  shortcut="⌘K"
                  onClick={() => setSelectedAction('Search')}
                />
              </Menu>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<MenuItem
  label="New Task"
  shortcut="Ctrl+K"
  onClick={() => {}}
/>`}</code>
              </pre>
            </div>
          </Card>

          {/* Loading States */}
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Loading States
              </h3>
              <Menu triggerLabel="With Loading">
                <MenuItem
                  label="Save Changes"
                  icon={<FiSettings />}
                  loading
                  onClick={() => {}}
                />
                <MenuItem
                  label="Export Data"
                  icon={<FiEdit />}
                  onClick={() => setSelectedAction('Export')}
                />
              </Menu>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<MenuItem
  label="Save Changes"
  loading={true}
  onClick={() => {}}
/>`}</code>
              </pre>
            </div>
          </Card>

          {/* Selected State */}
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Selected/Active State
              </h3>
              <Menu triggerLabel="Navigation">
                <MenuItem label="Home" icon={<FiHome />} href="/" selected />
                <MenuItem label="Profile" icon={<FiUser />} href="/profile" />
              </Menu>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<MenuItem
  label="Home"
  selected={true}
  href="/"
/>`}</code>
              </pre>
            </div>
          </Card>

          {/* Sections */}
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Menu Sections
              </h3>
              <Menu triggerLabel="With Sections">
                <MenuSection title="Account">
                  <MenuItem label="Profile" icon={<FiUser />} href="/profile" />
                  <MenuItem
                    label="Settings"
                    icon={<FiSettings />}
                    href="/settings"
                  />
                </MenuSection>
                <MenuSection title="Actions">
                  <MenuItem
                    label="Sign out"
                    icon={<FiLogOut />}
                    onClick={() => setSelectedAction('Sign out')}
                    danger
                  />
                </MenuSection>
              </Menu>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<Menu triggerLabel="Menu">
  <MenuSection title="Account">
    <MenuItem label="Profile" icon={<FiUser />} href="/profile" />
    <MenuItem label="Settings" icon={<FiSettings />} href="/settings" />
  </MenuSection>
  <MenuSection title="Actions">
    <MenuItem label="Sign out" onClick={() => {}} danger />
  </MenuSection>
</Menu>`}</code>
              </pre>
            </div>
          </Card>

          {/* Submenus */}
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">Submenus</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Menu triggerLabel="Opens Right (default)">
                  <MenuItem label="Settings" icon={<FiSettings />}>
                    <Menu>
                      <MenuItem
                        label="Account"
                        icon={<FiUser />}
                        href="/settings/account"
                      />
                      <MenuItem
                        label="Preferences"
                        icon={<FiSettings />}
                        href="/settings/preferences"
                      />
                    </Menu>
                  </MenuItem>
                  <MenuItem label="More Options" icon={<FiMoreVertical />}>
                    <Menu>
                      <MenuItem
                        label="Option 1"
                        icon={<FiStar />}
                        onClick={() => setSelectedAction('Option 1')}
                      />
                      <MenuItem
                        label="Option 2"
                        icon={<FiEdit />}
                        onClick={() => setSelectedAction('Option 2')}
                      />
                    </Menu>
                  </MenuItem>
                </Menu>
                <Menu triggerLabel="Opens Left">
                  <MenuItem
                    label="Settings"
                    icon={<FiSettings />}
                    submenuPlacement="left"
                  >
                    <Menu>
                      <MenuItem
                        label="Account"
                        icon={<FiUser />}
                        href="/settings/account"
                      />
                      <MenuItem
                        label="Preferences"
                        icon={<FiSettings />}
                        href="/settings/preferences"
                      />
                    </Menu>
                  </MenuItem>
                </Menu>
              </div>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<Menu triggerLabel="Menu">
  <MenuItem label="Settings" icon={<FiSettings />}>
    <Menu>
      <MenuItem label="Account" href="/settings/account" />
      <MenuItem label="Preferences" href="/settings/preferences" />
    </Menu>
  </MenuItem>
</Menu>

// Opens to the left instead
<MenuItem label="Settings" submenuPlacement="left">
  <Menu>...</Menu>
</MenuItem>`}</code>
              </pre>
            </div>
          </Card>

          {/* Custom Rendering */}
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Custom Item Rendering
              </h3>
              <div className="flex items-center">
                <Menu
                  width="w-96"
                  placement="bottom start"
                  triggerBadgeCount={2}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <FiMail />
                    </Button>
                  }
                >
                  <MenuItem onClick={() => setSelectedAction('Message 1')}>
                    <div className="flex items-start gap-3 w-full py-1">
                      <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <FiUser className="h-5 w-5 text-indigo-200" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white">
                            John Doe
                          </span>
                          <span className="text-xs text-zinc-400 shrink-0">
                            2m ago
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          Hey, are we still on for the meeting?
                        </p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0 mt-1" />
                    </div>
                  </MenuItem>
                </Menu>
              </div>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<MenuItem onClick={() => {}}>
  <div className="flex items-start gap-3">
    <Avatar />
    <div>
      <span>John Doe</span>
      <p>Message preview...</p>
    </div>
  </div>
</MenuItem>`}</code>
              </pre>
            </div>
          </Card>
        </section>

        {/* Advanced */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Advanced</h2>

          {/* Controlled State */}
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Controlled State
              </h3>
              <div className="flex items-center gap-4">
                <Menu
                  triggerLabel="Controlled Menu"
                  open={menuOpen}
                  onOpenChange={setMenuOpen}
                  onClose={() => console.log('Menu closed')}
                >
                  <MenuItem label="Profile" icon={<FiUser />} href="/profile" />
                  <MenuItem
                    label="Settings"
                    icon={<FiSettings />}
                    href="/settings"
                  />
                </Menu>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? 'Close' : 'Open'}
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                Menu is {menuOpen ? 'open' : 'closed'}
              </p>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`const [open, setOpen] = useState(false);

<Menu
  open={open}
  onOpenChange={setOpen}
  onClose={() => console.log('Closed')}
>
  <MenuItem label="Item" />
</Menu>`}</code>
              </pre>
            </div>
          </Card>

          {/* Custom Trigger */}
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Custom Trigger
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <Menu
                  trigger={
                    <Button variant="secondary" size="sm">
                      <FiMoreVertical />
                    </Button>
                  }
                >
                  <MenuItem label="Profile" icon={<FiUser />} href="/profile" />
                  <MenuItem
                    label="Settings"
                    icon={<FiSettings />}
                    href="/settings"
                  />
                </Menu>
                <Menu
                  trigger={
                    <button className="inline-flex items-center gap-2 rounded-full border border-indigo-400/60 bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/30">
                      Custom Button
                      <FiChevronDown className="h-4 w-4" />
                    </button>
                  }
                >
                  <MenuItem label="Profile" icon={<FiUser />} href="/profile" />
                  <MenuItem
                    label="Settings"
                    icon={<FiSettings />}
                    href="/settings"
                  />
                </Menu>
              </div>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<Menu trigger={<Button>Custom</Button>}>
  <MenuItem label="Item" />
</Menu>

// Or with triggerLabel for default button
<Menu triggerLabel="Menu">
  <MenuItem label="Item" />
</Menu>`}</code>
              </pre>
            </div>
          </Card>

          {/* Placement & Width */}
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Placement & Width
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <Menu placement="top start" triggerLabel="Top Start">
                  <MenuItem label="Item 1" href="/" />
                  <MenuItem label="Item 2" href="/" />
                </Menu>
                <Menu placement="bottom end" triggerLabel="Bottom End">
                  <MenuItem label="Item 1" href="/" />
                  <MenuItem label="Item 2" href="/" />
                </Menu>
                <Menu width="w-64" triggerLabel="Wide (w-64)">
                  <MenuItem label="Item 1" href="/" />
                  <MenuItem label="Item 2" href="/" />
                </Menu>
              </div>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`<Menu
  placement="bottom end"  // top start | top end | bottom start | bottom end
  width="w-64"            // Any Tailwind width class
  maxHeight="max-h-80"    // Custom max height
>
  <MenuItem label="Item" />
</Menu>`}</code>
              </pre>
            </div>
          </Card>
        </section>

        {/* Real-World Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Real-World Example
          </h2>
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Example of how Menu would be used in a Navbar
              </p>
              <div className="flex items-center justify-end">
                <Menu
                  trigger={
                    <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-white">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-200">
                        AB
                      </span>
                      <FiChevronDown className="h-4 w-4 text-zinc-400" />
                    </button>
                  }
                >
                  <MenuItem label="Profile" icon={<FiUser />} href="/profile" />
                  <MenuItem
                    label="Settings"
                    icon={<FiSettings />}
                    href="/settings"
                  />
                  <MenuDivider />
                  <MenuItem
                    label="Sign out"
                    icon={<FiLogOut />}
                    onClick={() => setSelectedAction('Sign out')}
                    danger
                  />
                </Menu>
              </div>
              <pre className="text-xs bg-zinc-900/50 rounded-lg p-4 overflow-x-auto">
                <code>{`// Navbar user menu
<Menu
  trigger={
    <button>
      <Avatar />
      <FiChevronDown />
    </button>
  }
>
  <MenuItem label="Profile" icon={<FiUser />} href="/profile" />
  <MenuItem label="Settings" icon={<FiSettings />} href="/settings" />
  <MenuDivider />
  <MenuItem 
    label="Sign out" 
    icon={<FiLogOut />} 
    onClick={handleSignOut}
    danger 
  />
</Menu>`}</code>
              </pre>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
