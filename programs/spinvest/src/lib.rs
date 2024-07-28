use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, Token, Transfer};
// use spl_token::instruction::swap;
use std::convert::Into;

declare_id!("FRsx4yExdH2QPpQW8NL2ks6ngPec4J8XVKNwk84VEBz3");

const SPINVEST_PDA_SEED: &[u8] = b"spinvesttest05";
const USER_PDA_SEED: &[u8] = b"spinvestusertest05";

#[program]
pub mod spinvest {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let spinvest_account = &mut ctx.accounts.spinvest_account;

        spinvest_account.usdc_balance = 0;
        spinvest_account.admin = ctx.accounts.admin_account.key();
        spinvest_account.bump = ctx.bumps.spinvest_account;

        Ok(())
    }

    pub fn register(ctx: Context<UserRegistration>) -> Result<()> {
        let user_pda_account = &mut ctx.accounts.user_pda_account;

        user_pda_account.staked_amount = 0;
        user_pda_account.bump = ctx.bumps.user_pda_account;

        Ok(())
    }

    pub fn submit_purchase(ctx: Context<SubmitPurchase>, purchase_amount: u64) -> Result<()> {
        let spinvest_account = &mut ctx.accounts.spinvest_account;
        let user_pda_account = &mut ctx.accounts.user_pda_account;
        let admin_account = &mut ctx.accounts.admin_account;

        require!(
            spinvest_account.admin == admin_account.key(),
            ErrorCode::Unauthorized
        );

        let mut reward = purchase_amount / 1000; // 0.1% reward
        if user_pda_account.staked_amount > 1000 {
            reward = purchase_amount / 100; // 1% reward
        }

        let cpi_accounts = MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: admin_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, reward)?;

        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, stake_amount: u64) -> Result<()> {
        let spinvest_account = &mut ctx.accounts.spinvest_account;
        let user_pda_account = &mut ctx.accounts.user_pda_account;

        let cpi_accounts = Transfer {
            from: ctx.accounts.user_usdc_account.to_account_info(),
            to: ctx.accounts.spinvest_usdc_account.to_account_info(),
            authority: ctx.accounts.user_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, stake_amount)?;

        spinvest_account.usdc_balance += stake_amount;
        user_pda_account.staked_amount += stake_amount;

        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>, unstake_amount: u64) -> Result<()> {
        let spinvest_account = &mut ctx.accounts.spinvest_account;
        let user_pda_account = &mut ctx.accounts.user_pda_account;
        let admin_account = &mut ctx.accounts.admin_account;

        require!(
            spinvest_account.admin == admin_account.key(),
            ErrorCode::Unauthorized
        );

        require!(
            user_pda_account.staked_amount >= unstake_amount,
            ErrorCode::UnstakeLimitExceeded
        );

        require!(
            spinvest_account.usdc_balance >= unstake_amount,
            ErrorCode::InsufficientFunds
        );

        let bump = &[spinvest_account.bump];
        let seeds: &[&[u8]] = &[SPINVEST_PDA_SEED.as_ref(), bump];
        let signer_seeds = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.spinvest_usdc_account.to_account_info(),
                    to: ctx.accounts.user_usdc_account.to_account_info(),
                    authority: spinvest_account.to_account_info(),
                },
                signer_seeds,
            ),
            unstake_amount,
        )?;

        spinvest_account.usdc_balance -= unstake_amount;
        user_pda_account.staked_amount -= unstake_amount;

        Ok(())
    }

    // pub fn submit_purchase_upgraded(
    //     ctx: Context<SubmitPurchaseUpgraded>,
    //     purchase_amount: u64,
    // ) -> Result<()> {
    //     let reward = purchase_amount / 100; // 1% reward

    //     // Mint reward tokens to the user
    //     let cpi_accounts = MintTo {
    //         mint: ctx.accounts.token_mint.to_account_info(),
    //         to: ctx.accounts.user_token_account.to_account_info(),
    //         authority: ctx.accounts.admin.clone(),
    //     };
    //     let cpi_program = ctx.accounts.token_program.to_account_info();
    //     let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    //     token::mint_to(cpi_ctx, reward)?;

    //     // Swap USDC to SOL (pseudo code, replace with actual CPI for a DEX swap)
    //     let swap_amount = purchase_amount;
    //     let _ = swap(
    //         &spl_token::ID,
    //         ctx.accounts.program_usdc_account.to_account_info().key,
    //         ctx.accounts.user_usdc_account.to_account_info().key,
    //         ctx.accounts.admin.to_account_info().key,
    //         swap_amount,
    //         0,
    //         spl_token::ID,
    //     );

    //     Ok(())
    // }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        seeds = [SPINVEST_PDA_SEED], 
        bump,
        payer = admin_account, 
        space = 8 + Spinvest::INIT_SPACE)
    ]
    pub spinvest_account: Account<'info, Spinvest>,
    #[account(mut)]
    pub admin_account: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UserRegistration<'info> {
    #[account(
        init, 
        seeds = [USER_PDA_SEED], 
        bump,
        payer = user_account, 
        space = 8 + UserData::INIT_SPACE)
    ]
    pub user_pda_account: Account<'info, UserData>,
    #[account(mut)]
    pub user_account: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitPurchase<'info> {
    #[account(
        mut, 
        seeds = [SPINVEST_PDA_SEED], 
        bump = spinvest_account.bump)
    ]
    pub spinvest_account: Account<'info, Spinvest>,
    #[account(
        mut,
        seeds = [USER_PDA_SEED], 
        bump = user_pda_account.bump)
    ]
    pub user_pda_account: Account<'info, UserData>,
    #[account(mut)]
    pub user_account: Signer<'info>,
    /// CHECK: This is the token account that we want to mint tokens to
    #[account(mut)]
    pub user_token_account: AccountInfo<'info>,
    /// CHECK: This is the token that we want to mint
    #[account(mut)]
    pub token_mint: AccountInfo<'info>,
    /// CHECK: the authority of the mint account
    #[account(signer)]
    pub admin_account: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        mut, 
        seeds = [SPINVEST_PDA_SEED], 
        bump = spinvest_account.bump)
    ]
    pub spinvest_account: Account<'info, Spinvest>,
    #[account(
        mut, 
        seeds = [USER_PDA_SEED], 
        bump = user_pda_account.bump)
    ]
    pub user_pda_account: Account<'info, UserData>,
    #[account(mut)]
    pub user_account: Signer<'info>,
    /// CHECK:
    #[account(mut)]
    pub user_usdc_account: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub spinvest_usdc_account: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    /// CHECK: This is the pda account to sign transfer
    #[account(
        mut, 
        seeds = [SPINVEST_PDA_SEED], 
        bump = spinvest_account.bump)
    ]
    pub spinvest_account: Account<'info, Spinvest>,
    #[account(
        mut, 
        seeds = [USER_PDA_SEED], 
        bump = user_pda_account.bump)
    ]
    pub user_pda_account: Account<'info, UserData>,
    #[account(mut)]
    pub user_account: Signer<'info>,
    /// CHECK: This is the pda account to sign transfer
    #[account(mut)]
    pub user_usdc_account: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub spinvest_usdc_account: AccountInfo<'info>,
    /// CHECK:
    #[account(signer)]
    pub admin_account: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Spinvest {
    pub admin: Pubkey,
    pub bump: u8,
    pub usdc_balance: u64,
}

impl Spinvest {
    pub const INIT_SPACE: usize = (32 + 2) + 8 + 64;
}

#[account]
pub struct UserData {
    pub staked_amount: u64,
    pub bump: u8,
}

impl UserData {
    pub const INIT_SPACE: usize = 8 + 64;
}

#[error_code]
pub enum ErrorCode {
    #[msg("The requested operation is not authorized.")]
    Unauthorized,

    #[msg("Exceeding unstake limit.")]
    UnstakeLimitExceeded,

    #[msg("Not sufficient project funds for withdrawal.")]
    InsufficientFunds,
}
