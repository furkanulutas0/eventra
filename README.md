1. Projeyi Forklayın. 
2. Kendi reponuzdaki projeyi clonelayın.
3. VSCode üzerinden cloneladığınız repoyu açın ve ana dizine gidin.
4. VS üzerinden terminali açın ve remote sunucusunu ekleyin.
```
git remote upstream add https://github.com/furkanulutas0/eventra.git
```
5. Reponun güncel versiyonunu upstream:development branchini çekin.
```
git pull upstream development
```
5.1 ana dizinde `npm install` komutunu çalıştırın.
5.2 ana dizinda backend sunucusunu çalıştırın -> `npm run dev`
5.3 `cd client` ile frontend sunucusuna girin.
5.4 `npm i` ile frontend sunucusunun paketlerini yükleyin.
5.5 `npm run dev` ile vite sunucusunu çalıştırın.
5.6 Her ikisinin de aynı anda çalıştığından emin olun.
6. vs üzerinden origin'de (kendi reponuz) yeni branch açın.
7. Kod üzerinde değişikliklerinizi yapın ve commitleyin.
8. Yaptığınız değişiklikleri bu repo üzerinden Pull Request açın. head: sizin branchiniz base: upstream->development olacak.
