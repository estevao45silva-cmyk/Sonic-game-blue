        this.loopAngle += this.loopSpeed * dt * (180 / Math.PI);
      }
      
      const rad = Phaser.Math.DegToRad(this.loopAngle);
      this.player.x = this.loopCenter.x + Math.cos(rad) * (this.LOOP_RADIUS - this.player.body.halfHeight);
      this.player.y = this.loopCenter.y + Math.sin(rad) * (this.LOOP_RADIUS - this.player.body.halfHeight);
      
      // Rotate GIF to match loop tangent
      if (this.playerGif) {
        const rotationDeg = this.loopAngle - 90;
        this.playerGif.setAngle(rotationDeg);
        this.playerGif.setScale(this.currentFlipX ? -1 : 1, 1);
        this.playerGif.setPosition(this.player.x, this.player.y);
      }
      
      // Exit Loop Condition
      if ((this.loopDirection === 1 && this.loopAngle <= -270) || (this.loopDirection === -1 && this.loopAngle >= 450)) {
        this.isLooping = false;
        // Zoom Camera back in
        this.cameras.main.zoomTo(1, 500, 'Sine.easeInOut');
        
        this.currentState = PlayerState.RUNNING;
        this.player.body.allowGravity = true;
        
        // Eject slightly above ground to prevent sinking into the tile bounds
        this.player.y -= 10;
        
        this.player.setVelocityX((this.loopSpeed * this.LOOP_RADIUS + 500) * this.loopDirection); // Shoot out faster!
        this.player.setVelocityY(-100); // Pop up out of the floor
        if (this.playerGif) {
           this.playerGif.setAngle(0);
           this.playerGif.setScale(this.currentFlipX ? -1 : 1, 1);
        }
      }
      
      return; // Skip normal physics while looping
    }

    // --- NORMAL PHYSICS ---

    // Update Enemies Patrol (Motobug)
    this.enemies.getChildren().forEach((enemy: any) => {
      if (!enemy.active) return;
      
      // Initialize state if not present
      if (!enemy.state) {
          enemy.state = 'patrol';
          enemy.direction = Math.random() > 0.5 ? 1 : -1;
          enemy.startX = enemy.x;
      }
      
      if (enemy.state === 'patrol') {
          enemy.setVelocityX(50 * enemy.direction);
          enemy.flipX = enemy.direction === 1;
          
          if (Math.abs(enemy.x - enemy.startX) > 150) {
              enemy.direction *= -1;
              enemy.startX = enemy.x; // avoid getting stuck
          }
      }
      
      const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const isPlayerNear = distToPlayer < 300 && Math.abs(enemy.y - this.player.y) < 100;
      
      if (isPlayerNear && this.currentState !== PlayerState.DEAD) {
        enemy.state = 'charge';
      } else if (distToPlayer > 400) {
        enemy.state = 'patrol';
      }
      
      if (enemy.state === 'charge') {
        const direction = this.player.x > enemy.x ? 1 : -1;
        enemy.setVelocityX(direction * 250);
        enemy.flipX = direction === 1;
      }
    });

    // Update Eggman Mini Bosses
    this.eggmanMiniBosses.getChildren().forEach((egg: any) => {
       if (!egg.active || egg.hp <= 0) return;
       egg.timer += dt;

       if (egg.gif) {
           egg.gif.setPosition(egg.x, egg.y);
           if (egg.body.velocity.x > 0) egg.gif.setScale(-1, 1);
           else if (egg.body.velocity.x < 0) egg.gif.setScale(1, 1);
       }

       if (Phaser.Math.Distance.Between(this.player.x, this.player.y, egg.x, egg.y) < 1000) {
           if (egg.state === 'idle') {
               egg.y = egg.startY + Math.sin(egg.timer * 3) * 30;
               if (egg.x > this.player.x + 50) egg.setVelocityX(-150);
               else if (egg.x < this.player.x - 50) egg.setVelocityX(150);
               else egg.setVelocityX(0);

               if (egg.timer > 3) {
                   if (Math.random() > 0.5) {
                       egg.state = 'shoot';
                       egg.shotFired = false;
                   } else {
                       egg.state = 'swoop';
                   }
                   egg.timer = 0;
               }
           } else if (egg.state === 'shoot') {
               egg.setVelocityX(0);
               if (!egg.shotFired) {
                   const proj = this.enemyProjectiles.create(egg.x, egg.y + 30, 'projectile_ph');
                   proj.setScale(0.04);
                   proj.body.allowGravity = true;
                   proj.setVelocityY(200);
                   const xVel = this.player.x > egg.x ? 250 : -250;
                   proj.setVelocityX(xVel);
                   egg.shotFired = true;
               }
               if (egg.timer > 1) {
                   egg.state = 'idle';
                   egg.timer = 0;
               }
           } else if (egg.state === 'swoop') {
               this.physics.moveToObject(egg, this.player, 600);
               if (egg.y > this.player.y || egg.timer > 1.5) {
                   egg.state = 'retreat';
                   egg.setVelocityY(-400);
               }
           } else if (egg.state === 'retreat') {
               if (egg.y <= egg.startY) {
                   egg.state = 'idle';
                   egg.timer = 0;
                   egg.setVelocityY(0);
               }
           }
       }
    });

    // Update Flying Enemies
    this.flyingEnemies.getChildren().forEach((flyer: any) => {
       if (!flyer.active) return;
       
       if (flyer.timer === undefined) flyer.timer = Math.random() * 2000;
       flyer.timer += dt * 1000;
       
       // Sine wave hovering
       flyer.setVelocityY(Math.sin(flyer.timer / 200) * 50);
       
       // Turn to face player
       if (this.player && this.player.x < flyer.x) {
          flyer.flipX = false;
       } else {
          flyer.flipX = true;
       }
       
       // Fire Projectile
       if (flyer.timer > 3000) {
          flyer.timer = 0;
          // Shoot at player
          if (Math.abs(this.player.x - flyer.x) < 800) {
              const proj = this.enemyProjectiles.create(flyer.x, flyer.y, 'projectile_ph');
              proj.setScale(24 / proj.width);
              proj.body.allowGravity = false;
              this.physics.moveToObject(proj, this.player, 300);
          }
       }
    });

    // Update Moving Platforms
    this.movingPlatforms.getChildren().forEach((plat: any) => {
       if (!plat.active) return;
       const startX = plat.startX || plat.x;
       if (plat.x < startX - 150) plat.setVelocityX(100);
       else if (plat.x > startX + 150) plat.setVelocityX(-100);
    });

    // Update Projectiles (cleanup & homing)
    this.enemyProjectiles.getChildren().forEach((proj: any) => {
       if (proj.y > 1500 || !proj.active) {
           proj.destroy();
       } else if (proj.isHoming) {
           this.physics.moveToObject(proj, this.player, 250);
           // Rotacionar o projétil visualmente na direção do jogador
           proj.rotation = Phaser.Math.Angle.Between(proj.x, proj.y, this.player.x, this.player.y);
           
           // Efeito visual (Smoke Trail)
           if (Math.random() > 0.3) {
               const smoke = this.add.circle(proj.x, proj.y, 6, 0x888888);
               this.tweens.add({ targets: smoke, alpha: 0, scale: 2, duration: 300, onComplete: () => smoke.destroy() });
           }
       }
    });

    // Check Water Status
    let touchingWater = false;
    this.physics.overlap(this.player, this.waterPools, () => { touchingWater = true; });
    if (this.isUnderwater && !touchingWater) {
       this.isUnderwater = false; // Exited water
       if (this.player.body.velocity.y < 0) this.player.setVelocityY(this.player.body.velocity.y * 1.5); // Pop out
    }
    
    // Speed Shoes Logic
    if (this.speedShoesTimer > 0) {
       this.speedShoesTimer -= delta;
    }
    const currentMaxSpeed = this.speedShoesTimer > 0 ? this.MAX_SPEED * 1.5 : (this.isUnderwater ? this.MAX_SPEED * 0.5 : this.MAX_SPEED);
    const currentAccel = this.isUnderwater ? this.ACCELERATION * 0.5 : this.ACCELERATION;
    const currentDrag = this.isUnderwater ? this.DRAG * 2 : this.DRAG;
    const currentJump = this.isUnderwater ? this.JUMP_FORCE * 0.6 : this.JUMP_FORCE;

    this.player.body.setMaxVelocity(currentMaxSpeed, 2500);

    // Update Boss
    if (this.boss && this.boss.active && (this.boss as any).hp > 0) {
       const b = this.boss as any;
       
       if (this.bossGif) {
           this.bossGif.setPosition(b.x, b.y);
           if (b.body.velocity.x > 0) this.bossGif.setScale(-1, 1);
           else if (b.body.velocity.x < 0) this.bossGif.setScale(1, 1);
       }
       
       // Partículas dos propulsores da nave do Eggman
       if (Math.random() > 0.3) {
           const engineY = b.y + 70; 
           const flame = this.add.circle(b.x, engineY, 10, Math.random() > 0.5 ? 0xFF8800 : 0xFF2200);
           this.tweens.add({ targets: flame, alpha: 0, y: engineY + 40, scale: 0.5, duration: 300, onComplete: () => flame.destroy() });
       }
       
       if (Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y) < 1500) {
          b.timer += dt;
          
          if (b.state === 'idle') {
             // Movimento pendular suave (Hovercraft)
             b.y = b.startY + Math.sin(b.timer * 3) * 50;
             const speed = 250;
             if (b.x > this.player.x + 100) b.setVelocityX(-speed);
             else if (b.x < this.player.x - 100) b.setVelocityX(speed);
             else b.setVelocityX(0);
             
             if (b.timer > 3) {
                 if (Math.random() > 0.5) {
                     b.state = 'shoot_homing';
                     b.shotFired = false;
                 } else {
                     b.state = 'swoop_prep';
                 }
                 b.timer = 0;
                 b.setVelocityX(0);
                 b.setVelocityY(0);
             }
          } else if (b.state === 'shoot_homing') {
             // Dispara um míssil teleguiado (agora maior e vermelho)
             if (!b.shotFired) {
                 const proj = this.enemyProjectiles.create(b.x, b.y + 30, 'projectile_ph');
                 proj.setScale(0.08); // Tamanho aumentado
                 proj.setTint(0xFF3333); // Fica ameaçador
                 proj.body.allowGravity = false; // Míssil não sofre gravidade
                 proj.isHoming = true;
                 b.shotFired = true;
             }
             if (b.timer > 0.5) {
                 b.state = 'idle';
                 b.timer = 0;
             }
          } else if (b.state === 'swoop_prep') {
             // Para e mira no jogador
             if (b.timer > 0.5) {
                b.state = 'swoop';
                b.timer = 0;
                this.physics.moveTo(b, this.player.x, this.player.y + 50, 800);
             }
          } else if (b.state === 'swoop') {
             // Mergulha em direção ao chão
             if (b.y >= this.player.y || b.body.blocked.down || b.body.touching.down) {
                 b.state = 'recover';
                 b.setVelocityX(b.body.velocity.x * 0.5); // Desacelera no X
                 b.setVelocityY(-400); // Sobe rápido
                 b.timer = 0;
             }
          } else if (b.state === 'recover') {
             // Retorna ao hover
             if (b.y <= b.startY) {
                 b.state = 'idle';
                 b.timer = 0;
                 b.setVelocityY(0);
             }
          }
       }
    } else if (this.bossGif) {
       this.bossGif.destroy();
       this.bossGif = undefined;
    }

    // V6 DOM Sync
    if (this.playerGif) {
      this.playerGif.setPosition(this.player.x, this.player.y);
      if (this.player.flipX !== this.currentFlipX) {
        this.currentFlipX = this.player.flipX;
        this.playerGif.setScale(this.currentFlipX ? -1 : 1, 1);
      }
    }

    this.bgWater.tilePositionX = this.cameras.main.scrollX * 0.3 + (time * 0.1);

    if (this.player.y > 1500) {
      this.currentState = PlayerState.DEAD;
      
      this.lives--;
      this.events.emit('updateLives', this.lives);
      
      if (this.lives > 0) {
         this.scene.restart({ 