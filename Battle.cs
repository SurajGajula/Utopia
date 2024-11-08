using UnityEngine;
using System.Collections;
using System.Linq;
using UnityEngine.UI;
using System.Threading.Tasks;
using TMPro;
using System.Collections.Generic;
public class Battle : MonoBehaviour
{
    public Stats[] allies;
    public Stats enemy;
    public Healthbar[] allybars;
    public Healthbar enemybar;
    public int pChain;
    public int eChain;
    public TextMeshProUGUI[] skills;
    public int curAlly;
    public TextMeshProUGUI chainTxt;
    public Menu menu;
    public GameObject battlescreen;
    public GameObject damagefab;
    public string[] StatusNames;
    public Sprite[] StatusIcons;
    public async void BattleStart()
    {
        battlescreen.SetActive(true);
        menu.MenuScreen.SetActive(false);
        await InitializeAllies();
        await InitializeEnemy();
        SetSkills(0);
        pChain = 3;
        SetChain();
    }
    private async Task InitializeAllies()
    {
        for (int i = 0; i < 3; i++)
        {
            GameObject allyInstance = Instantiate(menu.allies[i].gameObject, new Vector3(-2 * (i - 1), 1 - i, 0), Quaternion.identity);
            allyInstance.name = allyInstance.name.Replace("(Clone)", "");
            allies[i] = allyInstance.GetComponent<Stats>();
            await allies[i].GetStats(allies[i].gameObject.name);
            allybars[i].ResetStatuses();
            allybars[i].maxHealth = allies[i].health;
            allybars[i].SetFill(allies[i].health);
        }
    }
    private async Task InitializeEnemy()
    {
        GameObject enemyInstance = Instantiate(menu.enemies[0].gameObject, new Vector3(11, 1.5f, 0), Quaternion.identity);
        enemyInstance.name = enemyInstance.name.Replace("(Clone)", "");
        enemy = enemyInstance.GetComponent<Stats>();
        await enemy.GetStats(enemy.gameObject.name, false);
        enemybar.ResetStatuses();
        enemybar.maxHealth = enemy.health;
        enemybar.SetFill(enemy.health);
    }
    public void PSkillWrapper(int index)
    {
        StartCoroutine(PSkill(index));
    }
    public IEnumerator PSkill(int index)
    {
        if (pChain > 0)
        {
            for (int i = 0; i < allies[curAlly].skillhits[index]; i++)
            {
                yield return new WaitForSeconds(0.25f);
                int damage = DamageCalc(index);
                StartCoroutine(ShowDamage(damage));
                enemy.health -= damage;
                enemybar.SetFill(enemy.health);
            }
            yield return new WaitForSeconds(1f);
            if (enemy.health <= 0)
            {
                BattleEnd(true);
                yield break;
            }
            pChain -= 1;
            if (pChain == 0)
            {
                eChain = 3;
                StartCoroutine(ESkill());
            }
            SetChain();
        }
    }
    public IEnumerator ESkill()
    {
        while (eChain > 0)
        {
            int target = Random.Range(0, 3);
            int index = Random.Range(0, 3);
            for (int i = 0; i < enemy.skillhits[index]; i++)
            {
                yield return new WaitForSeconds(0.25f);
                int damage = DamageCalc(index, target);
                StartCoroutine(ShowDamage(damage, target));
                allies[target].health -= damage;
                allybars[target].SetFill(allies[target].health);
            }
            yield return new WaitForSeconds(1f);
            eChain -= 1;
            SetChain();
        }
        if (allies.Any(ally => ally.health <= 0))
        {
            BattleEnd(false);
            yield break;
        }
        pChain = 3;
        SetChain();
    }
    public async void BattleEnd(bool won)
    {
        Destroy(enemy.gameObject);
        if (won)
        {
            foreach (var ally in allies)
            {
                await ally.PutExp(ally.gameObject.name, 100);
            }
        }
        menu.MenuScreen.SetActive(true);
        System.Array.ForEach(allies, ally => Destroy(ally.gameObject));
        battlescreen.gameObject.SetActive(false);
    }
    public void SetSkills(int index)
    {
        curAlly = index;
        for (int i = 0; i < 3; i++)
        {
            skills[i].text = allies[curAlly].skillnames[i];
        }
    }
    public void SetChain()
    {
        chainTxt.text = (pChain > 0 ? "Player Chain: " + pChain : "Enemy Chain: " + eChain);
    }
    public IEnumerator ShowDamage(int damage, int target = 0)
    {
        Vector3 spawnOffset = (pChain == 0 ? Vector3.left : Vector3.right) + Vector3.up;
        Vector3 spawn = (pChain == 0 ? allies[target].transform.position : enemy.transform.position) + spawnOffset;
        GameObject damageTextInstance = Instantiate(damagefab, spawn, Quaternion.identity, transform);
        TextMeshProUGUI damageText = damageTextInstance.GetComponent<TextMeshProUGUI>();
        damageText.text = damage.ToString();
        float elapsedTime = 0f;
        Vector3 moveVector = Vector3.up * 2;
        while (elapsedTime < 0.5f)
        {
            damageTextInstance.transform.Translate(moveVector * Time.deltaTime);
            elapsedTime += Time.deltaTime;
            yield return null;
        }
        Destroy(damageTextInstance);
    }
    public int DamageCalc(int index, int target = 0)
    {
        bool isPlayerTurn = pChain > 0;
        int damage = isPlayerTurn ? allies[curAlly].attack : enemy.attack;
        string skillStatus = isPlayerTurn ? allies[curAlly].skillstatuses[index] : enemy.skillstatuses[index];
        List<string> targetStatuses = isPlayerTurn ? enemy.statuses : allies[target].statuses;
        Healthbar targetBar = isPlayerTurn ? enemybar : allybars[target];
        if (targetStatuses.Contains("Break"))
        {
            damage *= 2;
            targetStatuses.Remove("Break");
            targetBar.SetStatus("Break", false);
        }
        if (skillStatus == "Break")
        {
            targetStatuses.Add("Break");
            targetBar.SetStatus("Break");
        }
        return damage;
    }
}