import sqlite3

conn = sqlite3.connect('auth.db')
cursor = conn.cursor()

cursor.execute('SELECT id, name, email, password, role FROM users ORDER BY id')
rows = cursor.fetchall()

print('\n' + '='*70)
print('ALL USERS IN DATABASE')
print('='*70)

if len(rows) == 0:
    print('\nNo users found - database is empty')
else:
    for row in rows:
        print(f'\nID: {row[0]}')
        print(f'Name: {row[1]}')
        print(f'Email: {row[2]}')
        print(f'Password: {row[3]}')
        print(f'Role: {row[4].upper()}')
        print('-' * 50)

print('\n' + '='*70)
print(f'Total Users: {len(rows)}')
print('='*70 + '\n')

conn.close()
