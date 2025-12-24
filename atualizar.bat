@echo off
echo Atualizando projeto...
git add .
git commit -m "Atualizacao: %date% %time%"
git push origin main
echo Aguarde 2 minutos para o site atualizar!
pause